import React, { useState } from 'react';
import { ScrollView, VStack, Text, Box, Button, Heading, FormControl, Input, Image } from 'native-base';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import MapView, { Marker, Polyline, LatLng } from 'react-native-maps';
import { StyleSheet, Dimensions } from 'react-native';
import { RootStackParamList } from '../types'
import Footer from '../components/Footer';
import * as PLdecoder from '@mapbox/polyline';
import { GOOGLE_MAPS_API_KEY, EARTH_RADIUS, TOMTOM_API_KEY } from '@env';
import { calcPlacesLimit, segmentRoute, findRouteRestaurants, sortPlacesByDist, formatWaypString, formatCoords } from '../utils/routeFunctions';


type Props = NativeStackScreenProps<RootStackParamList, 'Map'>;

export default function MapScreen({ navigation }: Props) {

    const [departure, setDeparture] = useState<string>();
    const [arrival, setArrival] = useState<string>();
    const [coords, setCoords] = useState<LatLng[]>();
    const [markers, setMarkers] = useState<Array<object>>();
    const [infoBar, setInfoBar] = useState({
        isShown: false,
        distance: 0,
        time: 0,
        depTime: '',
        arrTime: ''
    });

    const createRoute = async () => {
        let locationMarkers: Array<object> = [];

        // Fetching google route from departure point to arrival point
        let resp = await fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${departure}&destination=${arrival}&key=${GOOGLE_MAPS_API_KEY}`);;
        let respJson = await resp.json();
        const placesLimit = calcPlacesLimit(respJson, 40000);
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

        // Removing coordinates that are 10km or closer from both departure and arrival points
        segmentRoute(tomtomCoords, points);

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

        // Assigning restaurants to the route if the route is long enough
        findRouteRestaurants(points, locationMarkers);

        // Assigning markers from the returned places and sorting them by distance
        sortPlacesByDist(placesJson, points, locationMarkers);

        // formating markers locations to be inserted into TomTom calculateRoute URL
        const waypUrl = formatWaypString(locationMarkers, points);

        // Calculating the route with places to visit and assigning it's coordinates to the coords state
        let waypRes = await fetch(`https://api.tomtom.com/routing/1/calculateRoute/${waypUrl}/json?computeBestOrder=false&avoid=unpavedRoads&key=${TOMTOM_API_KEY}`);
        let waypResJson = await waypRes.json();
        console.log(
            `\nDistance: ${waypResJson.routes[0].summary.lengthInMeters / 1000} km\nTime: ${waypResJson.routes[0].summary.travelTimeInSeconds / 60} min (only driving)\nDeparture time: ${waypResJson.routes[0].summary.departureTime}\nArrival time: ${waypResJson.routes[0].summary.arrivalTime}\n`)
        const waypCoords = formatCoords(waypResJson);
        setInfoBar({
            isShown: true,
            distance: waypResJson.routes[0].summary.lengthInMeters / 1000,
            time: waypResJson.routes[0].summary.travelTimeInSeconds / 60,
            depTime: waypResJson.routes[0].summary.departureTime,
            arrTime: waypResJson.routes[0].summary.arrivalTime
        });
        setMarkers(locationMarkers);
        setCoords(waypCoords);
    };


    return (
        <Box flex={1} pt="7">
            <ScrollView>
                <StatusBar style="auto"></StatusBar>
                <VStack>
                    <Heading p="3">Pasirinkite maršrutą: </Heading>
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
                        {markers && markers.map((marker: any, index: number) => (
                            <Marker
                                key={index}
                                coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
                                title={marker.description}
                            >
                                <Image
                                    alt="image"
                                    source={marker.image === 'restaurant' ? require('../assets/restaurant-pngrepo-com.png') : require('../assets/camera-svgrepo-com.png')}
                                    style={{ width: 26, height: 28 }}
                                    resizeMode="contain"
                                />
                            </Marker>
                        ))}

                    </MapView>
                    {infoBar.isShown && (
                        <Box style={{ width: '100%', height: 100 }}>
                            <Text>Distance: {infoBar.distance} km</Text>
                            <Text>Time: {infoBar.time} min (driving only)</Text>
                            <Text>Departure time: {infoBar.depTime}</Text>
                            <Text>Arrival time: {infoBar.arrTime}</Text>
                        </Box>
                    )}

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