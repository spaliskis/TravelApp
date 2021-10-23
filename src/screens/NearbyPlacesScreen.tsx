import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types'

type Props = NativeStackScreenProps<RootStackParamList, 'NearbyPlaces'>;

export default function NearbyPlacesScreen({ navigation, route }: Props) {

    return (
        <View>
            <Text>Nearby Places Screen {route.params.name}</Text>
        </View>
    );
}
