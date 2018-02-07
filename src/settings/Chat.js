/*
import React, { Component } from "react";
import { Text, View } from "react-native";
import { GiftedChat } from 'react-native-gifted-chat'

export default class Stack extends Component<{}> {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
    }
  }
  componentWillMount() {
    this.setState({
      messages: [
        {
          _id: 1,
          text: 'Hello developer',
          createdAt: new Date(),
          user: {
            _id: 2,
            name: 'React Native',
            avatar: 'https://facebook.github.io/react/img/logo_og.png',
          },
        },
      ],
    })
  }
  onSend(messages = []) {
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }))
  }
  render() {
    return (
      <View style={{ flex: 1//, alignItems: "center", justifyContent: "center"
         }}
      >
        <GiftedChat
          messages={this.state.messages}
          onSend={messages => this.onSend(messages)}
          user={{
            _id: 1,
          }}
        />
      </View>
    );
  }
}
*/


import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
} from 'react-native';

import moment from 'moment';
import api from '../components/Api';
import {GiftedChat, Actions, Bubble, SystemMessage} from 'react-native-gifted-chat';
import ImagePicker from 'react-native-image-picker';
import {Icon} from 'react-native-elements'

let options = {
  title: '',
  cancelButtonTitle: 'Отмена',
  takePhotoButtonTitle: 'Камера',
  chooseFromLibraryButtonTitle: 'Галерея',
  maxWidth: 1920,
  maxHeight: 1080,
  storageOptions: {
    skipBackup: true,
    path: 'images'
  }
};

export default class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      loadEarlier: true,
      typingText: null,
      isLoadingEarlier: false,
      visibleModal: false
    };

    this._isMounted = false;
    this.onSend = this.onSend.bind(this);
    this.onReceive = this.onReceive.bind(this);
    this.renderBubble = this.renderBubble.bind(this);
    this.renderSystemMessage = this.renderSystemMessage.bind(this);
    this.renderFooter = this.renderFooter.bind(this);
    this.onLoadEarlier = this.onLoadEarlier.bind(this);

    this._isAlright = null;
  }

  componentWillMount() {
    this._isMounted = true;
    api.getRooms()
      .then((answer)=>{
        if (answer.rooms.length === 0){
          api.createRoom()
            .then(() => this.getMessages);
        } else {
          this.getMessages();
        }
      });
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  getMessages() {
    return api.getMessages().then((answer) => {
      let messages = [];
      if (Array.isArray(answer.messages)) {
        answer.messages.forEach((item) => {
          messages.push({
            _id: item.id,
            text: item.body[0] == 'd' ? '' : item.body,
            createdAt: moment(item.createdAt).add(5, 'h').toDate(),
            user: {
              _id: this.props.name === item.username? 0:1,
              name: item.username,
            },
            image: item.body[0] == 'd' ? item.body : '',
            createdAt: moment(item.datetime).toDate()
          });
        });

        messages = messages.reverse();
        this.setState({
          messages: messages,
          loadEarlier: false,
          isLoadingEarlier: false,
        })
      }

    });
  }

  onLoadEarlier() {
    this.setState((previousState) => {
      return {
        isLoadingEarlier: true,
      };
    });
    this.getMessages();
  }

  onSend(messages = []) {
    this.setState((previousState) => {
      console.log(this.props.name);

      api.sendMessage(messages[0].text, this.props.name);

      return {
        messages: GiftedChat.append(previousState.messages, messages),
      };
    });
  }

  answerDemo(messages) {
    if (messages.length > 0) {
      if ((messages[0].image || messages[0].location) || !this._isAlright) {
        this.setState((previousState) => {
          return {
            typingText: 'React Native is typing'
          };
        });
      }
    }

    setTimeout(() => {
      if (this._isMounted === true) {
        if (messages.length > 0) {
          if (messages[0].image) {
            this.onReceive('Nice picture!');
          } else if (messages[0].location) {
            this.onReceive('My favorite place');
          } else {
            if (!this._isAlright) {
              this._isAlright = true;
              this.onReceive('Alright');
            }
          }
        }
      }

      this.setState((previousState) => {
        return {
          typingText: null,
        };
      });
    }, 1000);
  }

  onReceive(text) {
    this.setState((previousState) => {
      return {
        messages: GiftedChat.append(previousState.messages, {
          _id: Math.round(Math.random() * 1000000),
          text: text,
          createdAt: new Date(),
          user: {
            _id: 2,
            name: 'React Native',
            // avatar: 'https://facebook.github.io/react/img/logo_og.png',
          },
        }),
      };
    });
  }


  renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          left: {
            backgroundColor: '#f0f0f0',
          }
        }}
      />
    );
  }

  renderSystemMessage(props) {
    return (
      <SystemMessage
        {...props}
        containerStyle={{
          marginBottom: 15,
        }}
        textStyle={{
          fontSize: 14,
        }}
      />
    );
  }

  renderFooter(props) {
    if (this.state.typingText) {
      return (
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>
            {this.state.typingText}
          </Text>
        </View>
      );
    }
    return null;
  }

  handleOpenCameraRoll = (props) => {
    ImagePicker.showImagePicker(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      }
      else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      }
      else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      }
      else {
        api.sendMessage('data:image/png;base64,' + response.data, this.props.name);//todo починить отправку
      }
    });
  };

  renderImageMessage = (props) => {
    return (
      <TouchableOpacity
        onPress={() => {
          this.setState({visibleModal: true, imageUri: props.currentMessage.image});
        }}
      >
        <Image
          style={[{
            width: 150,
            height: 100,
            borderRadius: 13,
            margin: 3,
          }, props.imageStyle]}
          resizeMode="cover"
          source={{uri: props.currentMessage.image}}
        />
      </TouchableOpacity>
    );
  };

  showFullImage = () => {
    let fullImage = (<View/>);
    if (this.state.visibleModal) {
      fullImage = (
        <View style={styles.overlay}>
          <Image
            onLoadEnd={() => {
              this.setState({visibleIndicator: false});
            }}
            onLoadStart={() => {
              this.setState({visibleIndicator: true});
            }}
            resizeMode="contain"
            source={{uri: this.state.imageUri}}
            style={[{
              width: '100%',
              height: '100%',
            }]}
          />
          <TouchableOpacity
            style={styles.overlayCancel}
            onPress={() => {
              this.setState({visibleModal: false, imageUri: ''});
            }}
          >

            <Icon name={'close'} size={28}/>

          </TouchableOpacity>
        </View>
      );
    }
    return fullImage;
  };

  render() {
    return (
      <View style={[{flex: 1}]}>
        <GiftedChat
          messages={this.state.messages}
          onSend={this.onSend}
          loadEarlier={this.state.loadEarlier}
          onLoadEarlier={this.onLoadEarlier}
          isLoadingEarlier={this.state.isLoadingEarlier}
          renderMessageImage={this.renderImageMessage}
          user={{
            _id: 0,
            name: this.props.name, // sent messages should have same user._id
          }}
          onPressActionButton={this.handleOpenCameraRoll}
          renderBubble={this.renderBubble}
          renderSystemMessage={this.renderSystemMessage}
          renderFooter={this.renderFooter}
        />
        {this.showFullImage()}
      </View>
    );
  }
}


Chat.defaultProps = {
  name: 'John Sena'
};

const styles = StyleSheet.create({
  footerContainer: {
    marginTop: 5,
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 10,
  },
  footerText: {
    fontSize: 14,
    color: '#aaa',
  },
  overlay: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  overlayCancel: {
    padding: 20,
    position: 'absolute',
    right: 0,
    top: 0,
  },
});
