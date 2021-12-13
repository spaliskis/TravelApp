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
import MarkerTypes from '../interfaces/MarkerTypes';
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
    const [markers, setMarkers] = useState<MarkerTypes>({
        touristAttraction: [],
        monument: [],
        museum: [],
        park: [],
        restaurant: []
    });
    // const [placesLimit, setPlacesLimit] = useState<number>();
    const [infoBar, setInfoBar] = useState({
        isShown: false,
        distance: 0,
        time: '',
        depTime: '',
        arrTime: ''
    });
    const [preferences, setPreferences] = useState({
        museum: 5,
        park: 4,
        restaurant: 3,
        monument: 4,
        touristAttraction: 4,
    });

    const calculatePreferences = (placesLimit: number) => {
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

    const createRoute = async () => {
        let locationMarkers: MarkerTypes = {
            touristAttraction: [],
            monument: [],
            museum: [],
            park: [],
            restaurant: []
        };

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

        // Creating request URLs for getting places of each category
        let requests = [];
        requests.push(`https://api.tomtom.com/search/2/searchAlongRoute/museum.json?maxDetourTime=1200&limit=20&spreadingMode=auto&key=${TOMTOM_API_KEY}`);
        requests.push(`https://api.tomtom.com/search/2/searchAlongRoute/park.json?maxDetourTime=1200&limit=20&spreadingMode=auto&key=${TOMTOM_API_KEY}`);
        requests.push(`https://api.tomtom.com/search/2/searchAlongRoute/restaurant.json?maxDetourTime=1200&limit=20&spreadingMode=auto&key=${TOMTOM_API_KEY}`);
        requests.push(`https://api.tomtom.com/search/2/searchAlongRoute/monument.json?maxDetourTime=1200&limit=20&spreadingMode=auto&key=${TOMTOM_API_KEY}`);
        requests.push(`https://api.tomtom.com/search/2/searchAlongRoute/tourist%20attraction.json?maxDetourTime=1200&limit=20&spreadingMode=auto&key=${TOMTOM_API_KEY}`);

        // Asynchronously getting data from TomTom API
        const promises = requests.map((url) =>
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(placesReqBody)
            }).then((response) => response.json())
        );

        const data = await Promise.all(promises);

        // Assigning markers from the returned places and sorting them by distance
        createMarkers(data, points, locationMarkers);
        let slicedMarkers: MarkerTypes = {
            restaurant: locationMarkers.restaurant.slice(0, placesCount.restaurantCount),
            monument: locationMarkers.monument.slice(0, placesCount.monumentCount),
            park: locationMarkers.park.slice(0, placesCount.parkCount),
            museum: locationMarkers.museum.slice(0, placesCount.museumCount),
            touristAttraction: locationMarkers.touristAttraction.slice(0, placesCount.touristAttractionCount),
        }
        for (let category in slicedMarkers) {
            if (slicedMarkers.hasOwnProperty(category)) {
                slicedMarkers[category as keyof MarkerTypes].forEach(marker => marker.isSelected = true);
            }
        }

        let allSelectedMarkers: LocMarker[] = [];
        for (let category in slicedMarkers) {
            if (slicedMarkers.hasOwnProperty(category)) {
                slicedMarkers[category as keyof MarkerTypes].forEach(marker => allSelectedMarkers.push(marker));
            }
        }
        allSelectedMarkers.sort((marker1, marker2) => marker1.distFromDep - marker2.distFromDep);
        // formating markers locations to be inserted into TomTom calculateRoute URL
        const waypUrl = formatWaypString(allSelectedMarkers, points);

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
        setMarkers(slicedMarkers);
        setCoords(waypCoords);
        setPoints(points);
        fitToCoordinates(waypCoords);
    };

    const recalculateRoute = async (points: []) => {
        let selectedMarkers: LocMarker[] = [];
        for (let category in markers) {
            markers[category as keyof MarkerTypes].forEach(marker => {
                if (marker.isSelected) selectedMarkers.push(marker);
            });
        }
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
                bottom: 250,
                right: 5,
                left: 5
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
                        lineDashPattern={[1]}
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
                            lineDashPattern={[1]}
                            coordinates={coords}
                            strokeWidth={2}
                            strokeColor="red" />}

                        {(() => {
                            let allMarkers: any = [];
                            let key = 0;
                            for (let category in markers) {
                                if (markers.hasOwnProperty(category)) {
                                    markers[category as keyof MarkerTypes].forEach((marker: LocMarker, index: number) => {
                                        allMarkers.push(<Marker
                                            key={key}
                                            coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
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
                                                            case 'touristAttraction':
                                                                return require('../assets/camera-pngrepo-com.png');
                                                            case 'monument':
                                                                return require('../assets/pisa-monument-pngrepo-com.png');
                                                            case 'museum':
                                                                return require('../assets/museum-pngrepo-com.png');
                                                            case 'park':
                                                                return require('../assets/park-pngrepo-com.png')
                                                        }
                                                    }
                                                    )()}
                                                    style={marker.isSelected ? styles.selectedMarker : styles.marker}
                                                    resizeMode="contain"
                                                />
                                            </Box>
                                        </Marker>);
                                        key++;
                                    });
                                }
                            }
                            return allMarkers;
                        })()}
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
                                        let category = clickedMarker.image;
                                        let stateUpdate = Object.assign({}, markers);
                                        stateUpdate![category as keyof MarkerTypes].forEach(marker => {
                                            if (marker.id === clickedMarker.id) marker.isSelected = false;
                                        });

                                        setMarkers(stateUpdate);
                                        setRecalculateBtn(true);
                                    }} colorScheme="red">Išimti vietą</Button>
                                    :
                                    <Button onPress={() => {
                                        let category = clickedMarker.image;
                                        let stateUpdate = Object.assign({}, markers);
                                        stateUpdate![category as keyof MarkerTypes].forEach(marker => {
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
        height: Dimensions.get('window').height - 255,
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
        bottom: '0%',
        borderTopColor: 'black',
        borderTopWidth: 2,
        padding: 10
    },
});