import React, { useState, useEffect } from 'react';
import { ScrollView, VStack, HStack, Text, Box, Button, Heading, Checkbox } from 'native-base';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import MapView, { Marker, Polyline, Polygon, LatLng } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { StyleSheet, Dimensions } from 'react-native';
import { RootStackParamList } from '../types'
import Footer from '../components/Footer';
import { GOOGLE_MAPS_API_KEY, EARTH_RADIUS } from '../consts';
import * as PLdecoder from '@mapbox/polyline';
import { ObjectOrArray } from 'styled-system';
import dummyData from './dummy.json';
import path from 'path';
import * as FileSystem from 'expo-file-system';


type Props = NativeStackScreenProps<RootStackParamList, 'Map'>;

export default function NearbyPlacesScreen({ navigation }: Props) {

    const origin = { latitude: 54.687157, longitude: 25.279652 };
    const destination = { latitude: 54.898521, longitude: 23.903597 };
    const [state, setState] = useState<any>({
        coords: []
    });
    const [polygonCoords, setPolygonCoords] = useState<LatLng[]>();
    const [markers, setMarkers] = useState<any>();

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
        console.log(polyLength);
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
                // let resp = await fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${startLoc}&destination=${destinationLoc}&key=${GOOGLE_MAPS_API_KEY}`);
                // let placesRes = await fetch('https://maps.googleapis.com/maps/api/place/nearbysearch/json?keyword=restaurant&location=54.553429%2C23.340035&radius=1500&type=restaurant&key=AIzaSyAvRiUgJTZ1RMIGJ07b2J1EGnDvcgEtrEY');
                // let respJson = await resp.json();
                // let respString = JSON.stringify(respJson);
                // let placesResJson = await placesRes.json();
                let points = PLdecoder.decode(dummyData.routes[0].overview_polyline.points);
                let coords = points.map((point: any[]) => {
                    return {
                        latitude: point[0],
                        longitude: point[1]
                    }
                })
                setState({ coords: coords });
                console.log(state);
                setPolygonCoords(polygonPoints(points));
                let locationMarkers = [];
                for (let j = 0; j < points.length; j += 20) {
                    // service.nearbySearch({
                    //     location: { lat: waypoints[j][0], lng: waypoints[j][1] },
                    //     radius: '20000',
                    //     type: ['restaurant']
                    // }, callback);
                    let placesRes = await fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?keyword=park&location=${points[j][0]}%2C${points[j][1]}&radius=5000&key=${GOOGLE_MAPS_API_KEY}`);
                    let placesJson = await placesRes.json();
                    // console.log(placesJson);
                    for (let i = 0; i < placesJson.results.length; i++) {
                        const marker = {
                            latitude: placesJson.results[i].geometry.location.lat,
                            longitude: placesJson.results[i].geometry.location.lng,
                            description: placesJson.results[i].name,
                        }
                        locationMarkers.push(marker);
                    }
                }
                setMarkers(locationMarkers);
                // console.log(markers);
                return coords
            } catch (error) {
                return error;
            }
        }

        createRoute('Vilnius', 'Kaunas');
    }, []);



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
                        <Polyline
                            coordinates={state.coords}
                            strokeWidth={2}
                            strokeColor="red" />
                        <Polygon
                            coordinates={polygonCoords!}
                        />
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