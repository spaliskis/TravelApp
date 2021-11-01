import React from 'react';
import { ScrollView, Text, Box, Button, VStack, Heading, Center } from 'native-base';
import { StyleSheet, Dimensions } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import MapView from 'react-native-maps';
import { RootStackParamList } from '../types';
import Footer from '../components/Footer';
import Card from '../components/Card';

type Props = NativeStackScreenProps<RootStackParamList, 'NearbyPlaces'>;

export default function NearbyPlacesScreen({ navigation }: Props) {

    return (
        <Box flex={1} pt="7">
            <ScrollView>
                <StatusBar style="auto"></StatusBar>
                <VStack alignItems="center" space={3}>
                    <Heading alignItems="flex-start" p="3">Lankomos vietos netoliese: </Heading>
                    <Box>
                        <MapView
                            style={styles.map}
                            mapPadding={{
                                top: 100,
                                right: 100,
                                bottom: 100,
                                left: 100
                            }}
                            
                            initialRegion={{
                                latitude: 54.263789,
                                longitude: 23.986982,
                                latitudeDelta: 5.8,
                                longitudeDelta: 5.8,
                            }} ></MapView>
                    </Box>
                    <Card
                        title="Gedimino pilis"
                        description="Gotikinė pilis Vilniuje, kurios liekanos stūkso Gedimino kalno aikštelėje."
                        imageUrl="https://www.govilnius.lt/images/5ea6aeeb4a97c4372591f47e?w=750&h=500&fit=contain"
                        onPress={() =>
                            navigation.navigate('Details')
                          }
                    />
                </VStack>
            </ScrollView>
            <Footer />
        </Box>
    );
}

const styles = StyleSheet.create({
    map: {
        width: Dimensions.get('window').width - 10,
        height: Dimensions.get('window').height,
    },
});
