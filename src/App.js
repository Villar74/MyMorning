import React from "react";
import Navigator from "./Navigator"; // 1.0.0-beta.14
import {
  GoogleAnalyticsTracker,
  GoogleAnalyticsSettings
} from "react-native-google-analytics-bridge";
const GA_TRACKING_ID = "UA-105959733-1";
const tracker = new GoogleAnalyticsTracker(GA_TRACKING_ID);
GoogleAnalyticsSettings.setDispatchInterval(2);

// gets the current screen from navigation state
function getCurrentRouteName(navigationState) {
  if (!navigationState) {
    return null;
  }
  const route = navigationState.routes[navigationState.index];
  // dive into nested navigators
  if (route.routes) {
    return getCurrentRouteName(route);
  }
  return route.routeName;
}

export default () => (
  <Navigator
    onNavigationStateChange={(prevState, currentState) => {
      const currentScreen = getCurrentRouteName(currentState);
      const prevScreen = getCurrentRouteName(prevState);

      if (prevScreen !== currentScreen) {
        // the line below uses the Google Analytics tracker
        // change the tracker here to use other Mobile analytics SDK.
        tracker.trackScreenView(currentScreen);
      }
    }}
  />
);
