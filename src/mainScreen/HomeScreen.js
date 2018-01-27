import React, {Component} from "react";
import {Text, View} from "react-native";
import {Icon, Button} from "react-native-elements";
import ActionButton from 'react-native-action-button';
import {GoogleAnalyticsTracker} from "react-native-google-analytics-bridge";
import {Heading, Spinner} from "@shoutem/ui"

let tracker = new GoogleAnalyticsTracker("UA-105959733-1");
//todo отдельный компонент для трекинга, настроить тесты
export default class HomeScreen extends Component<{}> {
  constructor(props) {
    super(props);
    this.state = {
      showSpinner: false,
    }
  }
  fakeDownload = () => {
    if (this.state.showSpinner){
      this.setState({showSpinner: false});
    } else {
      setTimeout(() => {
        this.setState({showSpinner: true});
        setTimeout(() => {
          this.setState({showSpinner: false})
        }, 1000);
      }, 1000);

      tracker.trackEvent("Test", "Button pressed.");
    }
  };
//623231717416 номер из gcm
  render() {
    let spinner = <View/>;
    if (this.state.showSpinner){
      spinner = <Spinner style={{color: "#538aff", size: "large"}}/>;
    }
    return (
      <View style={{flex: 1, alignItems: "center", justifyContent: "center"}}>
        <Icon name={"alarm"}/>
        <Text>Home Screens</Text>
        <Heading>{"ЗДАРОВА"}</Heading>
        <Button
          icon={{name: "squirrel", type: "octicon"}}
          title="TEST BUTTON"
          backgroundColor={"#538aff"}
          onPress={() => {
            this.fakeDownload();
          }}
        />
        {spinner}
        <ActionButton
          buttonColor={"#4ea92b"}
          onPress={() => {
            console.log("hi")
          }}
        />
      </View>
    );
  }
}
