import React, { Component } from "react";
import { Text, View, Alert, TextInput } from "react-native";
import { Button } from "react-native-elements";

export default class Settings extends Component<{}> {

  constructor(props){
    super(props);
    this.state = {
      name: '',
    }
  }
//todo сохранять имена
  render() {
    const {navigate} = this.props.navigation;

    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Твое имя</Text>
        <TextInput style={[{width: '50%'}]} value={this.state.name} onChangeText={(name) => this.setState({name})}/>
        <Button
          icon={{ name: "squirrel", type: "octicon" }}
          title="Открыть чат"
          backgroundColor={"#538aff"}
          onPress={() => {
            navigate('Chat', {name: {name: this.state.name}})
          }}
        />
      </View>
    );
  }
}
