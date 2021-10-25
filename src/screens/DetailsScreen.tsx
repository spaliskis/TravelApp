import React from 'react';
import { ScrollView } from 'native-base';
import { Text, Box, Button } from 'native-base';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { RootStackParamList } from '../types';
import Footer from '../components/Footer';

type Props = NativeStackScreenProps<RootStackParamList, 'Details'>;

export default function DetailsScreen({ navigation }: Props) {

    return (
        <Box flex={1}>
            <ScrollView>
                <StatusBar style="auto"></StatusBar>
                <Text>Details Screen</Text>
            </ScrollView>
            <Footer />
        </Box>
    );
}
