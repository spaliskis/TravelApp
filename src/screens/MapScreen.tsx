import React, { useState, useRef, useEffect } from 'react';
import { ScrollView, VStack, Text, Box, Button, Heading, FormControl, Input, Image, HStack } from 'native-base';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import MapView, { Marker, Polyline, LatLng, Callout, Overlay } from 'react-native-maps';
import { StyleSheet, Dimensions } from 'react-native';
import { RootStackParamList } from '../types'
import Footer from '../components/Footer';
import * as PLdecoder from '@mapbox/polyline';
import { GOOGLE_MAPS_API_KEY, EARTH_RADIUS, TOMTOM_API_KEY } from '@env';
import { calcPlacesLimit, segmentRoute, findRouteRestaurants, createMarkers, formatWaypString, formatCoords } from '../utils/routeFunctions';
import alongRes from '../devResponses/alongRes';
import calculateRes from '../devResponses/calculateRes';
import directionsRes from '../devResponses/directionsRes';
import LocMarker from '../interfaces/LocMarker';
import { format } from 'date-fns';


type Props = NativeStackScreenProps<RootStackParamList, 'Map'>;

export default function MapScreen({ navigation }: Props) {
    const mapRef = useRef();
    const [departure, setDeparture] = useState<string>('Vilnius');
    const [arrival, setArrival] = useState<string>('Klaipeda');
    const [coords, setCoords] = useState<LatLng[]>();
    const [points, setPoints] = useState<[number, number]>();
    const [clickedMarker, setClickedMarker] = useState<LocMarker>();
    const [recalculateBtn, setRecalculateBtn] = useState<boolean>();
    const [markers, setMarkers] = useState<Array<LocMarker>>();
    // const [placesLimit, setPlacesLimit] = useState<number>();
    const [infoBar, setInfoBar] = useState({
        isShown: false,
        distance: 0,
        time: '',
        depTime: '',
        arrTime: ''
    });
    const [preferences, setPreferences] = useState({
        museum: 1,
        park: 4,
        restaurant: 5,
        monument: 1,
        touristAttraction: 2,
    });

    const calculatePreferences = (placesLimit: number) => {
        console.log(placesLimit)
        const totalMarks = preferences.museum + preferences.park + preferences.restaurant + preferences.monument + preferences.touristAttraction;
        const multiplier = placesLimit / totalMarks;
        const placesCount = {
            museumCount: Math.round(preferences.museum * multiplier),
            parkCount: Math.round(preferences.park * multiplier),
            restaurantCount: Math.round(preferences.restaurant * multiplier),
            monumentCount: Math.round(preferences.monument * multiplier),
            touristAttractionCount: Math.round(preferences.touristAttraction * multiplier),
        }
        return placesCount;
    };

    // useEffect(() => {
    //     calculatePreferences();
    // }, []);

    const createRoute = async () => {
        let locationMarkers: Array<LocMarker> = [];

        // Fetching google route from departure point to arrival point
        let resp = await fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${departure}&destination=${arrival}&key=${GOOGLE_MAPS_API_KEY}`);;
        let respJson = await resp.json();
        // let respJson = directionsRes;
        const plLimit = calcPlacesLimit(respJson, 40000);
        const placesCount = calculatePreferences(plLimit);
        console.log(placesCount);
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
        let placesRes = await fetch(`https://api.tomtom.com/search/2/searchAlongRoute/tourist attraction.json?maxDetourTime=1200&limit=20&spreadingMode=auto&key=${TOMTOM_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(placesReqBody)
        });
        let placesJson = await placesRes.json();
        // let placesJson = alongRes;

        // Assigning restaurants to the route if the route is long enough
        // findRouteRestaurants(points, locationMarkers);

        // Assigning markers from the returned places and sorting them by distance
        createMarkers(placesJson, points, locationMarkers);
        let slicedMarkers = locationMarkers.slice(0, plLimit);
        slicedMarkers.forEach(marker => marker.isSelected = true);
        slicedMarkers = slicedMarkers.sort((marker1, marker2) => marker1.distFromDep - marker2.distFromDep);


        // formating markers locations to be inserted into TomTom calculateRoute URL
        const waypUrl = formatWaypString(slicedMarkers, points);

        // Calculating the route with places to visit and assigning it's coordinates to the coords state
        let waypRes = await fetch(`https://api.tomtom.com/routing/1/calculateRoute/${waypUrl}/json?computeBestOrder=false&avoid=unpavedRoads&key=${TOMTOM_API_KEY}`);
        let waypResJson = await waypRes.json();
        // let waypResJson = calculateRes;
        console.log(
            `\nDistance: ${waypResJson.routes[0].summary.lengthInMeters / 1000} km\nTime: ${waypResJson.routes[0].summary.travelTimeInSeconds / 60} min (only driving)\nDeparture time: ${waypResJson.routes[0].summary.departureTime}\nArrival time: ${waypResJson.routes[0].summary.arrivalTime}\n`)
        const waypCoords = formatCoords(waypResJson);
        setInfoBar({
            isShown: true,
            distance: Math.round(waypResJson.routes[0].summary.lengthInMeters / 1000 * 10) / 10,
            time: `${Math.floor(waypResJson.routes[0].summary.travelTimeInSeconds / 3600)} h ${Math.floor(waypResJson.routes[0].summary.travelTimeInSeconds / 60 % 60)} min ${Math.floor(waypResJson.routes[0].summary.travelTimeInSeconds % 60)} s`,
            depTime: String(`${new Date(waypResJson.routes[0].summary.departureTime).getHours()}:${new Date(waypResJson.routes[0].summary.departureTime).getMinutes()}`),
            arrTime: String(`${new Date(waypResJson.routes[0].summary.arrivalTime).getHours()}:${new Date(waypResJson.routes[0].summary.arrivalTime).getMinutes()}`)
        });
        setMarkers(locationMarkers);
        setCoords(waypCoords);
        setPoints(points);
        fitToCoordinates(waypCoords);
    };

    const recalculateRoute = async (points: []) => {
        let selectedMarkers = [...markers].filter((marker) => marker.isSelected);
        selectedMarkers!.sort((marker1, marker2) => marker1.distFromDep - marker2.distFromDep);
        const waypUrl = formatWaypString(selectedMarkers!, points);
        // Calculating the route with places to visit and assigning it's coordinates to the coords state
        let waypRes = await fetch(`https://api.tomtom.com/routing/1/calculateRoute/${waypUrl}/json?computeBestOrder=false&avoid=unpavedRoads&key=${TOMTOM_API_KEY}`);
        let waypResJson = await waypRes.json();
        console.log(
            `\nDistance: ${waypResJson.routes[0].summary.lengthInMeters / 1000} km\nTime: ${waypResJson.routes[0].summary.travelTimeInSeconds / 60} min (only driving)\nDeparture time: ${waypResJson.routes[0].summary.departureTime}\nArrival time: ${waypResJson.routes[0].summary.arrivalTime}\n`)
        const waypCoords = formatCoords(waypResJson);
        setInfoBar({
            isShown: true,
            distance: Math.round(waypResJson.routes[0].summary.lengthInMeters / 1000 * 10) / 10,
            time: `${Math.floor(waypResJson.routes[0].summary.travelTimeInSeconds / 3600)} h ${Math.floor(waypResJson.routes[0].summary.travelTimeInSeconds / 60 % 60)} min ${Math.floor(waypResJson.routes[0].summary.travelTimeInSeconds % 60)} s`,
            depTime: String(`${new Date(waypResJson.routes[0].summary.departureTime).getHours()}:${new Date(waypResJson.routes[0].summary.departureTime).getMinutes()}`),
            arrTime: String(`${new Date(waypResJson.routes[0].summary.arrivalTime).getHours()}:${new Date(waypResJson.routes[0].summary.arrivalTime).getMinutes()}`)
        });
        setCoords(waypCoords);
        fitToCoordinates(waypCoords);
    };

    async function fitToCoordinates(coords: LatLng[]) {
        mapRef.current.fitToCoordinates(coords, {
            edgePadding: {
                top: 50,
                bottom: 550,
                right: 10,
                left: 10
            }
        });
    }


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
                    <MapView
                        ref={mapRef}
                        onPress={() => {
                            setClickedMarker(undefined);
                            if (infoBar.distance !== 0) {
                                setInfoBar(prevState => ({
                                    ...prevState,
                                    ['isShown']: true
                                }));
                            }
                        }}
                        initialRegion={{
                            latitude: 54.263789,
                            longitude: 23.986982,
                            latitudeDelta: 5.8,
                            longitudeDelta: 5.8,
                        }}
                        style={styles.map}
                    >
                        {coords && <Polyline
                            coordinates={coords}
                            strokeWidth={2}
                            strokeColor="red" />}
                        {markers && markers.map((marker: LocMarker, index: number) => (
                            <Marker
                                key={index}
                                coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
                                // calloutOffset={{ x: -8, y: 28 }}
                                // calloutAnchor={{ x: 0.5, y: 0.4 }}
                                onPress={() => {
                                    setClickedMarker(marker);
                                    setInfoBar(prevState => ({
                                        ...prevState,
                                        ['isShown']: false
                                    }));
                                }}
                            >
                                <Box>
                                    {marker.isSelected && <Box style={styles.arrowUp} />}
                                    <Image
                                        alt="image"
                                        source={(function () {
                                            switch (marker.image) {
                                                case 'restaurant':
                                                    return require('../assets/restaurant-pngrepo-com.png');
                                                case 'attraction':
                                                    return require('../assets/camera-pngrepo-com.png')
                                            }
                                        }
                                        )()}
                                        style={marker.isSelected ? styles.selectedMarker : styles.marker}
                                        resizeMode="contain"
                                    />
                                </Box>
                                {/* <Callout tooltip>
                                    <Box style={styles.container}>
                                        <Box style={styles.bubble}>
                                            <Box>
                                                <Text bold>{marker.title}{"\n"}Adresas: </Text>{marker.address}
                                            </Box>
                                        </Box>
                                        <Box style={styles.arrowBorder} />
                                        <Box style={styles.arrow} />
                                    </Box>
                                </Callout> */}
                            </Marker>
                        ))}
                    </MapView>
                    {infoBar.isShown && <Box style={styles.buttonBubble}>
                        <Text><Text bold>Atstumas: </Text>{infoBar.distance} km</Text>
                        <Text><Text bold>Kelionės trukmė (važiavimo): </Text>{infoBar.time}</Text>
                        <Text><Text bold>Kelionės pradžios laikas: </Text>{infoBar.depTime}</Text>
                        <Text><Text bold>Kelionės pabaigos laikas: </Text>{infoBar.arrTime}</Text>
                    </Box>}
                    {clickedMarker && <Box style={styles.buttonBubble}>
                        <HStack space={2}>
                            <Box w={"65%"}>
                                <Text bold>Pavadinimas: </Text><Text>{clickedMarker.title}</Text>
                                <Text bold>Adresas: </Text><Text>{clickedMarker.address}</Text>
                            </Box>
                            <Box style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }} w={"35%"}>
                                {clickedMarker.isSelected ?
                                    <Button onPress={() => {
                                        let stateUpdate = [...markers];
                                        stateUpdate!.forEach(marker => {
                                            if (marker.id === clickedMarker.id) marker.isSelected = false;
                                        });

                                        setMarkers(stateUpdate);
                                        setRecalculateBtn(true);
                                    }} colorScheme="red">Išimti vietą</Button>
                                    :
                                    <Button onPress={() => {
                                        let stateUpdate = [...markers];
                                        stateUpdate!.forEach(marker => {
                                            if (marker.id === clickedMarker.id) marker.isSelected = true;
                                        });
                                        setMarkers(stateUpdate);
                                        setRecalculateBtn(true);
                                    }} colorScheme="green">Pridėti vietą</Button>}
                                {recalculateBtn && <Button mt={2} onPress={async () => {
                                    await recalculateRoute(points); setRecalculateBtn(false); setClickedMarker(undefined);
                                }} colorScheme="pink">Perskaičiuoti</Button>}
                            </Box>
                        </HStack>

                    </Box>}
                </VStack>

            </ScrollView>
            <Footer />
        </Box>
    );
}

const styles = StyleSheet.create({
    map: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height - 201,
    },
    container: {
        flexDirection: 'column',
        alignSelf: 'flex-start',
    },
    bubble: {
        minWidth: 250,
        flexDirection: 'row',
        alignSelf: 'flex-start',
        backgroundColor: '#FFF',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 6,
        borderColor: '#000',
        borderWidth: 0.5,
    },
    arrow: {
        backgroundColor: 'transparent',
        borderWidth: 16,
        borderColor: 'transparent',
        borderTopColor: '#000',
        alignSelf: 'center',
        marginTop: -32,
    },
    arrowBorder: {
        backgroundColor: 'transparent',
        borderWidth: 16,
        borderColor: 'transparent',
        borderTopColor: '#FFF',
        alignSelf: 'center',
        marginTop: -0.5,
    },
    marker: {
        width: 20,
        height: 22
    },
    selectedMarker: {
        width: 36,
        height: 38,
    },
    arrowUp: {
        alignSelf: 'center',
        width: 0,
        height: 0,
        borderRightWidth: 8,
        borderRightColor: 'transparent',
        borderLeftWidth: 8,
        borderLeftColor: 'transparent',
        borderTopWidth: 8,
        borderTopColor: 'black'
    },
    buttonBubble: {
        flex: 1,
        alignSelf: 'center',
        width: '100%',
        backgroundColor: 'white',
        // paddingHorizontal: 18,
        paddingVertical: 12,
        position: 'absolute',
        bottom: '9%',
        borderTopColor: 'black',
        borderTopWidth: 2,
        padding: 10
    },
});