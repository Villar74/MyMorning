'use strict';

var ReactNative = require('react-native');

var {
  AsyncStorage,
  Platform
} = ReactNative;

const DeviceInfo = require('react-native-device-info');

function currentTime(){ // current time in seconds
  return Math.floor((new Date().getTime())/(1000));
}

/**
 * Обертка к АПИ Интерсвязи
 */
class IsApi {
  constructor() {
    if (__DEV__ === true) {
      this.apiBaseUrl = 'http://77.55.208.32:8000';
      console.trace('apiBaseUrl:' + this.apiBaseUrl);
    }
    else {
      this.apiBaseUrl = 'http://77.55.208.32:8000';
    }
    this.defaultNetworkTimeout = 30000; // 30 sec
    this.cacheTtl = 0; // no caching by default

    this.uniqueDeviceId = DeviceInfo.getUniqueID();
  }

  cache(ttl) {
    this.cacheTtl = ttl;
    return this;
  }

  timeout(sec) {
    this.timeoutSec = sec;
    return this;
  }


  getMessages() {
    return this._exec('GET', '/rooms/0/messages');
  }

  getRooms() {
    return this._exec('GET', '/rooms?searchString=1');
  }

  sendMessage(message, userName) {
    return this._exec('POST', '/rooms/0/messages', {"body": message, "username": userName});
  }

  createRoom() {
    return this._exec('POST', '/rooms', {"name": "Test room 1"});
  }

  saveDeviceInfo(token, info = null) {
    var type = Platform.OS === 'ios' ? 1 : 2;
    return this._exec('PUT', '/mobile/pushtoken/add-with-device-id', {
      TOKEN: token,
      TYPE: type,
      UNIQUE_DEVICE_ID: info.uniqueDeviceId,
      FIRST_SIM_PHONE: info.firstSimPhone,
      AUTHORIZE_PHONE: info.authorizePhone,
      VERS_NAME: info.versName,
      ASSEMBLY_CODE: info.assemblyCode,
      OS_VERS: info.osVers,
      DEVICE_MODEL: info.deviceModel
    });
  }


  _getCache(key, ttl){
    if (ttl === 0) {
      return new Promise.reject(null);
    }
    return AsyncStorage.getItem(key).then((item) => {
      if (item !== null) {
        const _data = JSON.parse(item);
        if (_data.hasOwnProperty('expr') && currentTime() < parseInt(_data.expr, 10)){
          console.trace('Result served from cache ' + key);
          return _data.value;
        }
      }
      throw 'missing cache data';
    }).catch(() => {throw 'missing cache data';});
  }

  _setCache(key, value, ttl){
    if (ttl > 0) {
      const data = {
        expr: currentTime() + ttl,
        value: value
      };
      return AsyncStorage.setItem(key, JSON.stringify(data));
    }
  }

  _exec(method, url, params, returnheaders, headers = {}) {
    const cacheKey = `${this.token}_${url}_${params ? JSON.stringify(params) : ''}`;
    const self = this;
    const ttl = this.cacheTtl;
    const timeout = this.timeoutSec ? this.timeoutSec * 1000 : this.defaultNetworkTimeout;
    this.cacheTtl = 0;
    this.timeoutSec = 0;

    const cachePromise = this._getCache(cacheKey, ttl)
      .catch(() => {
        return new Promise(function (resolve, reject) {
          var xhr = new XMLHttpRequest();
          xhr.timeout = timeout;
          xhr.onreadystatechange = () => {
            if (xhr.readyState === xhr.DONE) {
              try {
                var data;
                if (returnheaders == true) {
                  data = [];
                  data[0] = JSON.parse(xhr.responseText);
                  data[1] = parseInt(xhr.getResponseHeader('X-Pagination-Page-Count'));
                }
                else if (xhr.responseText && xhr.responseText.length > 0) {
                  data = JSON.parse(xhr.responseText);
                }
              }
              catch (exception) {
                console.warn(exception, xhr.responseText);
                reject({status: 0, error: 'При обработке ответа произошла ошибка'});
              }
              if (xhr.status === 200 || xhr.status === 201) {
                if (method == 'GET') {
                  self._setCache(cacheKey, data, ttl);
                }
                resolve(data);
              }
              else if (xhr.status === 204) {
                resolve();
              }
              else if (xhr.status === 422) {
                reject({status: xhr.status, error: self.errorSummary(data), data: data});
              }
              else if (xhr.status >= 400 && xhr.status < 500) {
                let message = data && data.hasOwnProperty('message') ? data.message : 'Произошла ошибка клиента';
                reject({status: xhr.status, error: message, data: data});
              }
              else if (xhr.status >= 500 && xhr.status < 600) {
                let message = data && data.hasOwnProperty('message') ? data.message : 'Произошла внутренняя ошибка сервера';
                reject({status: xhr.status, error: message, data: data});
              }
              else if (xhr.status !== 0) {
                reject({status: xhr.status, error: xhr.responseText, data: data});
              }
              else {
                console.log('Ошибки сети:', xhr.responseText);
                reject({status: 0, error: 'Произошла ошибка сети'});
              }
            }
          };
          xhr.open(method, self.apiBaseUrl + url);
          let defaultHeaders =
            {
              'Content-type': 'application/json',
              'Accept-Language': 'ru-RU',
              'Accept': 'application/json'
            };

          headers = Object.assign(defaultHeaders, headers);

          for (var key in headers) {
            if (headers.hasOwnProperty(key)) {
              xhr.setRequestHeader(key, headers[key]);
            }
          }
          if (self.token !== undefined) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + self.token);
          }
          console.trace('Executing: ' + method + ' ' + url);

          // Отправка запросов с таймаутом для имитации задержек
          // setTimeout(()=>{xhr.send(JSON.stringify(params))}, 1500);

          xhr.send(JSON.stringify(params));
        });
      });
    return cachePromise;
  }

  uploadFile(fileData) {
    var self = this;
    return new Promise(function (resolve, reject) {
      var headers = {
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + self.token,
        'Content-type': 'multipart/form-data',
        'Accept-Language': 'ru-RU'
      };

      let fullName = (fileData.hasOwnProperty('uri') && fileData.uri.indexOf("content://") == -1) ? fileData.uri : fileData.path;
      let fileName = fullName.substring(fullName.lastIndexOf("/") + 1);

      var data = new FormData();
      data.append('file', {
        uri: fileData.uri,
        name: fileName,
        filename: fileName,
        type: 'multipart/form-data'
      });
      fetch(self.apiBaseUrl + '/files/upload', {
        method: 'POST',
        follow: 0,
        headers: headers,
        body: data
      }).then(response => {
        if (response.status === 200) {
          return response.json();
        } else if (response.status === 422) {
          let message = self.errorSummary(JSON.parse(response._bodyText));
          throw new Error('Произошла ошибка при загрузке файла. ' + message);
        } else {
          let message = __DEV__ ? response.status + ' ' + response._bodyText : 'Произошла внутренняя ошибка сервера, код ' + response.status;
          throw new Error(message);
        }
      })
        .then(jsonData => {
          console.log(jsonData);
          resolve(jsonData);
        })
        .catch(e => {
          console.warn(e);
          reject(e);
        });
    });
  }
}

module.exports = new IsApi;