import React, { Component } from "react";
import { Text, View } from "react-native";
import { Icon, Button } from "react-native-elements";
import { GoogleAnalyticsTracker } from "react-native-google-analytics-bridge";
let tracker = new GoogleAnalyticsTracker("UA-105959733-1");
//todo отдельный компонент для трекинга
export default class HomeScreen extends Component<{}> {
  render() {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Icon name={"alarm"} />
        <Text>Home Screens</Text>
        <Button
          icon={{ name: "squirrel", type: "octicon" }}
          title="TEST BUTTON"
          backgroundColor={"#538aff"}
          onPress={() => {
            tracker.trackEvent("Test", "Button pressed.");
          }}
        />
      </View>
    );
  }
}
