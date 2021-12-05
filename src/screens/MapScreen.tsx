import React, { useState, useEffect } from 'react';
import { ScrollView, VStack, HStack, Text, Box, Button, Heading, Checkbox, FormControl, Input } from 'native-base';
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
import { GOOGLE_MAPS_API_KEY, EARTH_RADIUS, TOMTOM_API_KEY } from '@env';
import * as geolib from 'geolib';
import { WebView } from 'react-native-webview';
import mapTemplate from '../components/map-template';


type Props = NativeStackScreenProps<RootStackParamList, 'Map'>;

export default function MapScreen({ navigation }: Props) {

    let webRef = undefined;
    const [departure, setDeparture] = useState<string>();
    const [arrival, setArrival] = useState<string>();
    const [points, setPoints] = useState<Array<[]>>();
    const [coords, setCoords] = useState<LatLng[]>();
    const [polygonCoords, setPolygonCoords] = useState<LatLng[]>();
    const [markers, setMarkers] = useState<Array<object>>();

    const createRoute = async () => {
        // Fetching google route from departure point to arrival point
        let resp = await fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${departure}&destination=${arrival}&key=${GOOGLE_MAPS_API_KEY}`);;
        let respJson = await resp.json();
        let dirAPIdistance = 0;
        respJson.routes[0].legs.forEach((leg: object) => {
            dirAPIdistance += leg.distance.value;
        });
        const placesLimit = Math.ceil(dirAPIdistance / 30000);
        console.log(placesLimit);
        let points = PLdecoder.decode(respJson.routes[0].overview_polyline.points);
        let coordinates = points.map((point: any[]) => {
            return {
                latitude: point[0],
                longitude: point[1]
            }
        });
        // Converting coordinates to format suitable for TomTom API
        let tomtomCoords = coordinates.map((point) => {
            return {
                lat: point.latitude,
                lon: point.longitude
            }
        });
        // These two loops remove coordinates that are 10km or closer from both departure and arrival points
        for (let i = 0; i < tomtomCoords.length; i += 10) {
            if (distance(points[0][0], points[0][1], tomtomCoords[i].lat, tomtomCoords[i].lon) > 10) {
                tomtomCoords.splice(0, i);
                break;
            }
        }
        for (let i = tomtomCoords.length-1; i >= 0; i -= 10) {
            if (distance(points[points.length-1][0], points[points.length-1][1], tomtomCoords[i].lat, tomtomCoords[i].lon) > 10) {
                tomtomCoords.splice(i, tomtomCoords.length);
                break;
            }
        }
        // Creating body for TomTom along search API, getting places from the API
        let placesReqBody = {
            route: {
                points: tomtomCoords,
            }
        }
        let placesRes = await fetch(`https://api.tomtom.com/search/2/searchAlongRoute/tourist attraction.json?maxDetourTime=1200&limit=${placesLimit}&spreadingMode=auto&key=${TOMTOM_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(placesReqBody)
        });
        let placesJson = await placesRes.json();
        // let filteredPlaces = placesJson.results.sort((res1, res2) => res1.score < res2.score).slice(0, 5);
        // Assigning markers from the returned places and sorting them by distance
        let locationMarkers = [];
        for (let i = 0; i < placesJson.results.length; i++) {
            const distFromDep = distance(points[0][0], points[0][1], placesJson.results[i].position.lat, placesJson.results[i].position.lon);
            const marker = {
                latitude: placesJson.results[i].position.lat,
                longitude: placesJson.results[i].position.lon,
                description: placesJson.results[i].poi.name,
                distFromDep
            }
            locationMarkers.push(marker);
        }
        locationMarkers = locationMarkers.sort((marker1, marker2) => marker1.distFromDep - marker2.distFromDep);
        // formating markers locations to be inserted into TomTom calculateRoute URL
        let waypointsArr = locationMarkers.map(marker => {
            return `${marker.latitude}%2C${marker.longitude}`
        });
        waypointsArr.unshift(`${points[0][0]}%2C${points[0][1]}`);
        waypointsArr.push(`${points[points.length - 1][0]}%2C${points[points.length - 1][1]}`);
        let waypointsURL = waypointsArr.join('%3A');
        // Calculating the route with places to visit and assigning it's coordinates to the coords state
        let waypRes = await fetch(`https://api.tomtom.com/routing/1/calculateRoute/${waypointsURL}/json?computeBestOrder=false&avoid=unpavedRoads&key=${TOMTOM_API_KEY}`);
        let waypResJson = await waypRes.json();
        console.log(
            `\nDistance: ${waypResJson.routes[0].summary.lengthInMeters/1000} km\nTime: ${waypResJson.routes[0].summary.travelTimeInSeconds / 60} min (only driving)\nDeparture time: ${waypResJson.routes[0].summary.departureTime}\nArrival time: ${waypResJson.routes[0].summary.arrivalTime}\n`)
        let waypCoords = [];
        waypResJson.routes[0].legs.forEach(leg => {
            for (let point of leg.points) {
                waypCoords.push({
                    latitude: point.latitude,
                    longitude: point.longitude
                })
            }
        });
        setMarkers(locationMarkers);
        setCoords(waypCoords);
    };




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
        // console.log(`Amount of points: ${polyLength}`);
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

    const distance = (depLat: number, depLon: number, markerLat: number, markerLon: number) => {
        depLat = depLat * Math.PI / 180;
        depLon = depLon * Math.PI / 180;
        markerLat = markerLat * Math.PI / 180;
        markerLon = markerLon * Math.PI / 180;
        // Haversine formula
        let dlon = markerLon - depLon;
        let dlat = markerLat - depLat;
        let a = Math.pow(Math.sin(dlat / 2), 2)
            + Math.cos(depLat) * Math.cos(markerLat)
            * Math.pow(Math.sin(dlon / 2), 2);

        let c = 2 * Math.asin(Math.sqrt(a));

        // Radius of earth in kilometers. Use 3956
        // for miles
        let r = 6371;

        // calculate the result
        return (c * r);
    }

    return (
        <Box flex={1} pt="7">
            <ScrollView>
                <StatusBar style="auto"></StatusBar>
                <VStack>
                    <Heading p="3">Pasirinkite maršrutą: </Heading>

                    {/* <HStack>
                        <Checkbox.Group flexDirection="row" flexWrap="wrap" alignItems="flex-start">
                            <Checkbox
                                m="2"
                                name="museum"
                                value="museum">
                                Muziejai
                            </Checkbox>
                            <Checkbox
                                m="2"
                                name="park"
                                value="park">
                                Parkai
                            </Checkbox>
                            <Checkbox
                                m="2"
                                name="famous_place"
                                value="famous_place">
                                Įžymios vietos
                            </Checkbox>
                            <Checkbox
                                m="2"
                                name="hotel"
                                value="hotel">
                                Viešbučiai
                            </Checkbox>
                            <Checkbox
                                m="2"
                                name="restaurant"
                                value="restaurant">
                                Restoranai
                            </Checkbox>
                            <Button>Submit</Button>
                        </Checkbox.Group>

                    </HStack> */}
                    <FormControl isRequired>
                        <Box style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around' }}>
                            <Box style={{ display: 'flex', flexDirection: 'column' }}>
                                <FormControl.Label>Išvykimo vieta</FormControl.Label>
                                <Input
                                    size="lg"
                                    placeholder="Išvykimo vieta"
                                    onChangeText={(text: string) => setDeparture(text)}
                                />
                            </Box>
                            <Box style={{ display: 'flex', flexDirection: 'column' }}>
                                <FormControl.Label>Atvykimo vieta</FormControl.Label>
                                <Input
                                    size="lg"
                                    placeholder="Atvykimo vieta"
                                    onChangeText={(text: string) => setArrival(text)}
                                />
                            </Box>
                        </Box>
                        <Button style={{ alignSelf: 'center' }} onPress={() => createRoute()} >Ieškoti</Button>
                    </FormControl>
                    <MapView initialRegion={{
                        latitude: 54.263789,
                        longitude: 23.986982,
                        latitudeDelta: 5.8,
                        longitudeDelta: 5.8,
                    }} style={styles.map}>
                        {coords && <Polyline
                            coordinates={coords}
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