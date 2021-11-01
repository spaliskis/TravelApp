import React from 'react';
import { ScrollView, VStack, HStack, Text, Box, Button, Heading, Checkbox } from 'native-base';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import MapView from 'react-native-maps';
import { StyleSheet, Dimensions } from 'react-native';
import { RootStackParamList } from '../types'
import Footer from '../components/Footer';

type Props = NativeStackScreenProps<RootStackParamList, 'Map'>;

export default function NearbyPlacesScreen({ navigation }: Props) {

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
                    }} style={styles.map}></MapView>
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