import React from 'react';
import { ScrollView } from 'native-base';
import { Text, Box, Button } from 'native-base';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import MapView from 'react-native-maps';
import { StyleSheet, Dimensions } from 'react-native';
import { RootStackParamList } from '../types'
import Footer from '../components/Footer';

type Props = NativeStackScreenProps<RootStackParamList, 'Map'>;

export default function NearbyPlacesScreen({ navigation }: Props) {

    return (
        <Box flex={1}>
            <ScrollView>
                <StatusBar style="auto"></StatusBar>
                <Text>Map Screen</Text>
                <MapView style={styles.map}></MapView>
            </ScrollView>
            <Footer />
        </Box>
    );
}

const styles = StyleSheet.create({
    map: {
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height,
    },
  });