import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import HomeScreen from './src/screens/HomeScreen';
import TurfDetailScreen from './src/screens/TurfDetailScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import BookingSuccessScreen from './src/screens/BookingSuccessScreen';
import AttractiveBottomTab from './src/components/AttractiveBottomTab';
import AnimatedScreenWrapper from './src/components/AnimatedScreenWrapper';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Wrapper for Tab Screens
const TabScreenWrapper = ({ component: Component, ...props }) => {
  return (
    <AnimatedScreenWrapper focused={props.navigation.isFocused()}>
      <Component {...props} />
    </AnimatedScreenWrapper>
  );
};

const TabNavigator = () => (
  <Tab.Navigator
    tabBar={(props) => <AttractiveBottomTab {...props} />}
    screenOptions={({ route }) => ({
      headerShown: false,
      // Every time the tab is switched, we want to trigger the animation
      unmountOnBlur: true, 
    })}
  >
    <Tab.Screen name="Home">
      {(props) => <AnimatedScreenWrapper focused={props.navigation.isFocused()}><HomeScreen {...props} /></AnimatedScreenWrapper>}
    </Tab.Screen>
    <Tab.Screen name="Scores">
      {(props) => <AnimatedScreenWrapper focused={props.navigation.isFocused()}><HomeScreen {...props} /></AnimatedScreenWrapper>}
    </Tab.Screen>
    <Tab.Screen name="Stats">
      {(props) => <AnimatedScreenWrapper focused={props.navigation.isFocused()}><HomeScreen {...props} /></AnimatedScreenWrapper>}
    </Tab.Screen>
    <Tab.Screen name="Profile">
      {(props) => <AnimatedScreenWrapper focused={props.navigation.isFocused()}><ProfileScreen {...props} /></AnimatedScreenWrapper>}
    </Tab.Screen>
  </Tab.Navigator>
);

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Splash"
        screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen name="TurfDetail" component={TurfDetailScreen} />
        <Stack.Screen name="BookingSuccess" component={BookingSuccessScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
