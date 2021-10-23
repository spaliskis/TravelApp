import React from 'react';
import { StyleSheet, Text, View, Pressable, ImageBackground, Button } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types'

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export default function WelcomeScreen({ navigation }: Props) {

  return (
    <View style={styles.container} >
      <ImageBackground style={styles.backgroundImage} source={require('../assets/Sudargas.jpeg')}>
        <View style={styles.heading}>
          <Text>Sveiki atvyke</Text>
        </View>
        <View style={styles.navContainer}>
          <Button
            title="Go to user's profile"
            onPress={() =>
              navigation.navigate('NearbyPlaces', { name: 'Jane' })
            }
          />
          <Button
            title="Go to map screen"
            onPress={() =>
              navigation.navigate('Map')
            }
          />
          <View style={styles.navBar}>
            <Pressable android_ripple={{ borderless: true, radius: 50 }} style={styles.icnoBehave}>
              <FontAwesome size={40} name="home" color="black" />
            </Pressable>
            <Pressable android_ripple={{ borderless: true, radius: 50 }} style={styles.icnoBehave}>
              <FontAwesome size={40} name="heart" color="black" />
            </Pressable>
            <Pressable android_ripple={{ borderless: true, radius: 50 }} style={styles.icnoBehave}>
              <FontAwesome size={40} name="gear" color="black" />
            </Pressable>
            <Pressable android_ripple={{ borderless: true, radius: 50 }} style={styles.icnoBehave}>
              <FontAwesome size={40} name="map" color="black" />
            </Pressable>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
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
  container: {
    flex: 1,
  },
  heading: {
    paddingTop: 20,
  },
});