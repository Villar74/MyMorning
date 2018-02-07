/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React from "react";
import {StackNavigator, TabNavigator} from "react-navigation"; // 1.0.0-beta.14
import HomeScreen from "./mainScreen/HomeScreen";
import Settings from "./settings/Settings";
import Chat from "./settings/Chat";
import {Icon} from "react-native-elements";
import {withMappedNavigationProps} from 'react-navigation-props-mapper'

const HomeTab = StackNavigator({
  Home: {
    screen: HomeScreen,
    path: '/',
    navigationOptions: () => ({
      title: 'Home',
    }),
  },
});

const SettingsTab = StackNavigator({
  Settings: {
    screen: Settings,
    path: '/',
    navigationOptions: () => ({
      title: 'Settings',
    }),
  },
  Chat: {
    screen: withMappedNavigationProps(Chat),
    navigationOptions: {
      title: 'Chat',
    },
  },
});

function createComponent(instance, props) {
  return () => React.createElement(instance, props);
}

const Navigator = TabNavigator(
  {
    Home: {
      screen: HomeTab,
      path: '/',
      navigationOptions: {
        tabBarLabel: "Home",
        tabBarIcon: ({tintColor}) => (
          <Icon name={"alarm"} size={20} color={tintColor}/>
        )
      }
    },
    Settings: {
      screen: SettingsTab,
      path: '/settings',
      navigationOptions: {
        tabBarLabel: "Settings",
        tabBarIcon: ({tintColor}) => (
          <Icon name={"settings"} size={20} color={tintColor}/>
        )
      }
    }
  },
  {
    tabBarPosition: "bottom",
    tabBarOptions: {
      labelStyle: {
        fontSize: 12
      },
      tabStyle: {
        flex: 1,
        flexDirection: "row"
      },
      showIcon: true
    }
  }
);

export default Navigator;

/*const instructions = Platform.select({
  ios: "Press Cmd+R to reload,\n" + "Cmd+D or shake for dev menu",
  android:
    "Double tap R on your keyboard to reload,\n" +
    "Shake or press menu button for dev menu"
});

export default class App extends Component<{}> {
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>Welcome to React Native!</Text>
        <Text style={styles.instructions}>To get started, edit App.js</Text>
        <Text style={styles.instructions}>{instructions}</Text>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF"
  },
  welcome: {
    fontSize: 20,
    textAlign: "center",
    margin: 10
  },
  instructions: {
    textAlign: "center",
    color: "#333333",
    marginBottom: 5
  }
});*/
