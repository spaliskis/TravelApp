import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import WelcomeScreen from './src/screens/WelcomeScreen';
import NearbyPlacesScreen from './src/screens/NearbyPlacesScreen';
import MapScreen from './src/screens/MapScreen';
import {RootStackParamList} from './src/types'


const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ title: 'Welcome' }}
        />
        <Stack.Screen name="NearbyPlaces" component={NearbyPlacesScreen} />
        <Stack.Screen name="Map" component={MapScreen} />
      </Stack.Navigator>
      {/* <View style={styles.container} >
        <StatusBar style="auto"></StatusBar>
        <WelcomeScreen />
      </View> */}
    </NavigationContainer>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  navContainer: {
    position: 'absolute',
    alignItems: 'center',
    bottom: 20,
  },
  navBar: {
    flexDirection: 'row',
    width: '90%',
    backgroundColor: '#eee',
    justifyContent: 'space-evenly',
    borderRadius: 20,
  },
  icnoBehave: {
    padding: 14,
  },

});
