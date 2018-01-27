import React, { Component } from "react";
import { Text, View, Alert } from "react-native";
import { Button } from "react-native-elements";

export default class Settings extends Component<{}> {
  goToChat = () => {
    const {navigate} = this.props.navigation;

    Alert.alert('Кто ты?', '', [
      {
        text: 'Катя', onPress: () => {
          navigate('Stack', {name: 1})

        }
      },
      {
        text: 'Макс', onPress: () => {
          navigate('Stack', {name: 2})
        }
      }
    ]);
  };
  render() {
    const {navigate} = this.props.navigation;

    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Settings</Text>
        <Button
          icon={{ name: "squirrel", type: "octicon" }}
          title="Открыть чат"
          backgroundColor={"#538aff"}
          onPress={() => {this.goToChat();}}
        />
      </View>
    );
  }
}
