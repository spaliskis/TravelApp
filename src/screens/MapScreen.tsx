import React, { useState, useEffect } from 'react';
import { ScrollView, VStack, HStack, Text, Box, Button, Heading, Checkbox } from 'native-base';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import MapView, { Marker, Polyline, Polygon, LatLng } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { StyleSheet, Dimensions } from 'react-native';
import { RootStackParamList } from '../types'
import Footer from '../components/Footer';
import * as PLdecoder from '@mapbox/polyline';
import { ObjectOrArray } from 'styled-system';
import dummyData from './dummy.json';
import { dummyPlaces } from './dummyPlaces';
import path from 'path';
import * as FileSystem from 'expo-file-system';
import { GOOGLE_MAPS_API_KEY, EARTH_RADIUS } from '@env';


type Props = NativeStackScreenProps<RootStackParamList, 'Map'>;

export default function NearbyPlacesScreen({ navigation }: Props) {
    console.log(EARTH_RADIUS);
    const origin = { latitude: 54.687157, longitude: 25.279652 };
    const destination = { latitude: 54.898521, longitude: 23.903597 };
    const [state, setState] = useState<any>({
        coords: []
    });
    const [points, setPoints] = useState<any[]>();
    const [polygonCoords, setPolygonCoords] = useState<LatLng[]>();
    const [markers, setMarkers] = useState<any>();
    let categories = ['museum', 'park', 'famous_place', 'hotel', 'restaurant'];
    const [checkedState, setCheckedState] = useState<boolean[]>(new Array(5).fill(false));

    const polygonArray = (latitude: number) => {
        const upper_offset = 10000;
        const lower_offset = -10000;
        const LatUp = upper_offset / EARTH_RADIUS;
        const LatDown = lower_offset / EARTH_RADIUS;
        const latUpper = latitude + (LatUp * 180) / Math.PI;
        const latLower = latitude + (LatDown * 180) / Math.PI;

        return [latUpper, latLower];
    }

    const polygonPoints = (points: any) => {
        let polypoints = points;
        let polyLength = polypoints.length;
        console.log(`Amount of points: ${polyLength}`);
        let upperBound = [];
        let lowerBound = [];
        for (let j = 0; j <= polyLength - 1; j++) {
            let newPoints = polygonArray(polypoints[j][0]);
            upperBound.push({ latitude: newPoints[0], longitude: polypoints[j][1] });
            lowerBound.push({ latitude: newPoints[1], longitude: polypoints[j][1] });
        }
        let reversebound = lowerBound.reverse();
        let fullPoly = upperBound.concat(reversebound);
        return fullPoly;
    }

    useEffect(() => {
        async function createRoute(startLoc: string | object, destinationLoc: string | object) {
            try {
                let resp = await fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${startLoc}&destination=${destinationLoc}&key=${GOOGLE_MAPS_API_KEY}`);
                let respJson = await resp.json();
                let points = PLdecoder.decode(respJson.routes[0].overview_polyline.points);
                // let points = PLdecoder.decode(dummyData.routes[0].overview_polyline.points);
                setPoints(points);
                let coords = points.map((point: any[]) => {
                    return {
                        latitude: point[0],
                        longitude: point[1]
                    }
                })
                setState({ coords: coords });
                setPolygonCoords(polygonPoints(points));
                // let locationMarkers = [];
                // for (let j = 0; j < points.length; j += 20) {
                //     let placesRes = await fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?keyword=park&location=${points[j][0]}%2C${points[j][1]}&radius=5000&key=${GOOGLE_MAPS_API_KEY}`);
                //     let placesJson = await placesRes.json();
                //     for (let i = 0; i < placesJson.results.length; i++) {
                //         const marker = {
                //             latitude: placesJson.results[i].geometry.location.lat,
                //             longitude: placesJson.results[i].geometry.location.lng,
                //             description: placesJson.results[i].name,
                //         }
                //         locationMarkers.push(marker);
                //     }
                // }
                // setMarkers(dummyPlaces);
                return coords
            } catch (error) {
                return error;
            }
        }

        createRoute('Vilnius', 'Kaunas');
    }, []);

    const getPlaces = async (points: any[], category: string) => {
        console.log('inside method');
        let locationMarkers: any[] = [];
        for (let j = 0; j < points.length; j += 20) {
            console.log('inside loop');
            let placesRes = await fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?keyword=${category}&location=${points[j][0]}%2C${points[j][1]}&radius=5000&key=${GOOGLE_MAPS_API_KEY}`);
            console.log('fetched data');
            let placesJson = await placesRes.json();
            for (let i = 0; i < placesJson.results.length; i++) {
                const marker = {
                    latitude: placesJson.results[i].geometry.location.lat,
                    longitude: placesJson.results[i].geometry.location.lng,
                    description: placesJson.results[i].name,
                }
                locationMarkers.push(marker);
            }
            console.log('added markers');
        }
        await setMarkers(locationMarkers);
        console.log('markers set');
    }


    const handleOnChange = (position: number) => {
        const updatedCheckedState = checkedState.map((item, index) =>
            index === position ? !item : item
        );
        setCheckedState(updatedCheckedState);
    }

    const submitForm = () => {
        let submitValues = [];
        for (let i = 0; i < categories.length; i++) {
            if (checkedState[i]) {
                submitValues.push(categories[i]);
            }
        }
        submitValues.forEach(async (category) => {
            console.log('SUBMITTING: ' + category);
            await getPlaces(points, category);
        });
    }

    return (
        <Box flex={1} pt="7">
            <ScrollView>
                <StatusBar style="auto"></StatusBar>
                <VStack>
                    <Heading p="3">Pasirinkite maršrutą: </Heading>
                    <HStack>
                        <Checkbox.Group flexDirection="row" flexWrap="wrap" alignItems="flex-start">
                            <Checkbox
                                onChange={() => handleOnChange(0)}
                                isChecked={checkedState[0]}
                                m="2"
                                name="museum"
                                value="museum">
                                Muziejai
                            </Checkbox>
                            <Checkbox
                                onChange={() => handleOnChange(1)}
                                isChecked={checkedState[1]}
                                m="2"
                                name="park"
                                value="park">
                                Parkai
                            </Checkbox>
                            <Checkbox
                                onChange={() => handleOnChange(2)}
                                isChecked={checkedState[2]}
                                m="2"
                                name="famous_place"
                                value="famous_place">
                                Įžymios vietos
                            </Checkbox>
                            <Checkbox
                                onChange={() => handleOnChange(3)}
                                isChecked={checkedState[3]}
                                m="2"
                                name="hotel"
                                value="hotel">
                                Viešbučiai
                            </Checkbox>
                            <Checkbox
                                onChange={() => handleOnChange(4)}
                                isChecked={checkedState[4]}
                                m="2"
                                name="restaurant"
                                value="restaurant">
                                Restoranai
                            </Checkbox>
                            <Button onPress={() => submitForm()}>Submit</Button>
                        </Checkbox.Group>

                    </HStack>
                    <MapView initialRegion={{
                        latitude: 54.263789,
                        longitude: 23.986982,
                        latitudeDelta: 5.8,
                        longitudeDelta: 5.8,
                    }} style={styles.map}>
                        {state && <Polyline
                            coordinates={state.coords}
                            strokeWidth={2}
                            strokeColor="red" />}
                        {polygonCoords && <Polygon
                            coordinates={polygonCoords!}
                        />}
                        {markers && markers.map((marker: any, index: number) => (
                            <Marker
                                key={index}
                                coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
                                title={marker.description}
                            />
                        ))}
                    </MapView>
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