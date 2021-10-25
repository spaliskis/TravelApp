import React from 'react';
import { ScrollView } from 'native-base';
import { Text, Box, Button } from 'native-base';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { RootStackParamList } from '../types'
import Footer from '../components/Footer';

type Props = NativeStackScreenProps<RootStackParamList, 'MyRoutes'>;

export default function MyRoutesScreen({ navigation }: Props) {

    return (

        <Box flex={1}>
            <ScrollView>
                <StatusBar style="auto"></StatusBar>
                <Text>My Routes Screen</Text>
            </ScrollView>
            <Footer />
        </Box>
    );
}
