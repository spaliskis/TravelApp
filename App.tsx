import React from 'react';
import { NativeBaseProvider } from 'native-base';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from './src/screens/WelcomeScreen';
import NearbyPlacesScreen from './src/screens/NearbyPlacesScreen';
import MapScreen from './src/screens/Map/MapScreen';
import DetailsScreen from './src/screens/DetailsScreen';
import MyRoutesScreen from './src/screens/MyRoutesScreen';
import AccountScreen from './src/screens/AccountScreen';
import { RootStackParamList } from './src/types';


const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NativeBaseProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{
          headerShown: false
        }} >
          <Stack.Screen
            name="Map"
            component={MapScreen}
            options={{ title: 'Map' }}
          />
          {/* <Stack.Screen name="NearbyPlaces" component={NearbyPlacesScreen} /> */}
          {/* <Stack.Screen name="Map" component={MapScreen} /> */}
          {/* <Stack.Screen name="Details" component={DetailsScreen} />
          <Stack.Screen name="MyRoutes" component={MyRoutesScreen} />
          <Stack.Screen name="Account" component={AccountScreen} /> */}
        </Stack.Navigator>
      </NavigationContainer>
    </NativeBaseProvider>
  );
}
