import React from 'react';
import { ScrollView } from 'native-base';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Text, Box, Button } from 'native-base';
import { RootStackParamList } from '../types';
import Footer from '../components/Footer';

type Props = NativeStackScreenProps<RootStackParamList, 'NearbyPlaces'>;

export default function NearbyPlacesScreen({ navigation }: Props) {

    return (
        <Box flex={1}>
            <ScrollView>
                <StatusBar style="auto"></StatusBar>
                <Text>Nearby Places Screen</Text>
                <Button
                    onPress={() =>
                        navigation.navigate('Details')
                    }
                >Go to details screen</Button>
            </ScrollView>
            <Footer />
        </Box>
    );
}
