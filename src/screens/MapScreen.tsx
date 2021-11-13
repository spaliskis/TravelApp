import React from 'react';
import { ScrollView, VStack, HStack, Text, Box, Button, Heading, Checkbox } from 'native-base';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { StyleSheet, Dimensions } from 'react-native';
import { RootStackParamList } from '../types'
import Footer from '../components/Footer';
import { GOOGLE_MAPS_API_KEY } from '../config';

type Props = NativeStackScreenProps<RootStackParamList, 'Map'>;

export default function NearbyPlacesScreen({ navigation }: Props) {

    const origin = { latitude: 54.687157, longitude: 25.279652 };
    const destination = { latitude: 54.898521, longitude: 23.903597 };

    return (
        <Box flex={1} pt="7">
            <ScrollView>
                <StatusBar style="auto"></StatusBar>
                <VStack>
                    <Heading p="3">Pasirinkite maršrutą: </Heading>
                    <HStack>
                        <Checkbox.Group flexDirection="row" flexWrap="wrap" alignItems="flex-start">
                            <Checkbox m="2" value="museums">
                                Muziejai
                            </Checkbox>
                            <Checkbox m="2" value="parks">
                                Parkai
                            </Checkbox>
                            <Checkbox m="2" value="sightseeing">
                                Įžymios vietos
                            </Checkbox>
                            <Checkbox m="2" value="hotels">
                                Viešbučiai
                            </Checkbox>
                            <Checkbox m="2" value="restaurants">
                                Restoranai
                            </Checkbox>
                        </Checkbox.Group>

                    </HStack>
                    <MapView initialRegion={{
                        latitude: 54.263789,
                        longitude: 23.986982,
                        latitudeDelta: 5.8,
                        longitudeDelta: 5.8,
                    }} style={styles.map}>
                        <MapViewDirections
                            origin={origin}
                            destination={destination}
                            apikey={GOOGLE_MAPS_API_KEY}
                            strokeWidth={3}
                            strokeColor="hotpink"
                        />
                    </MapView>
                </VStack>

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