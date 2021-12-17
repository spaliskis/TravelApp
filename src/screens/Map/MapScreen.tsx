import React, { useState, useRef, useEffect } from 'react';
import { ScrollView, VStack, Box, Heading } from 'native-base';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import MapView, { Polyline, LatLng, Callout, Overlay } from 'react-native-maps';
import { RootStackParamList } from '../../types'
import Footer from '../../components/Footer';
import * as PLdecoder from '@mapbox/polyline';
import { GOOGLE_MAPS_API_KEY, TOMTOM_API_KEY } from '@env';
import { calcPlacesLimit, segmentRoute, createMarkers, createMarker, formatWaypString, formatCoords, calculatePreferences, sliceMarkers, consoleString } from './functions/routeFunctions';
import alongRes from '../../devResponses/alongRes';
import calculateRes from '../../devResponses/calculateRes';
import directionsRes from '../../devResponses/directionsRes';
import LocMarker from '../../interfaces/LocMarker';
import MarkerTypes from '../../interfaces/MarkerTypes';
import categoryUtilsObj from './categoryUtils';
import { createInfoBar } from './functions/utilFunctions';
import styles from './MapStyle';
import PlacesForm from './components/PlacesForm';
import FilterBox from './components/FilterBox';
import MapMarker from './components/MapMarker'
import InfoBox from './components/InfoBox';
import MarkerBox from './components/MarkerBox';


type Props = NativeStackScreenProps<RootStackParamList, 'Map'>;

export default function MapScreen({ navigation }: Props) {
    const mapRef = useRef();
    const [departure, setDeparture] = useState<string>('Vilnius');
    const [arrival, setArrival] = useState<string>('Klaipeda');
    const [coords, setCoords] = useState<LatLng[]>();
    const [altCoords, setAltCoords] = useState<LatLng[]>();
    const [points, setPoints] = useState<[number, number]>();
    const [clickedMarker, setClickedMarker] = useState<LocMarker>();
    const [recalculateBtn, setRecalculateBtn] = useState<boolean>();
    const [displayedMarkers, setDisplayedMarkers] = useState<MarkerTypes>();
    const [markers, setMarkers] = useState<MarkerTypes>();
    const [placesBody, setPlacesBody] = useState<object>();
    const [categoryUtils, setCategoryUtils] = useState<object>(categoryUtilsObj);
    const [infoBar, setInfoBar] = useState<object>({
        isShown: false,
        distance: 0,
    });
    const [preferences, setPreferences] = useState({
        museum: 5,
        park: 4,
        monument: 4,
        touristAttraction: 4,
    });
    const createRoute = async () => {
        let locationMarkers: MarkerTypes = { touristAttraction: [], monument: [], museum: [], park: [], restaurant: [], evStation: [], gasStation: [], hotel: [], };

        // Fetching google route from departure point to arrival point
        let resp = await fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${departure}&destination=${arrival}&alternatives=true&key=${GOOGLE_MAPS_API_KEY}`);
        let respJson = await resp.json();
        // let respJson = directionsRes;
        const plLimit = calcPlacesLimit(respJson, 40000);
        const placesCount = calculatePreferences(preferences, plLimit);
        console.log('Amount of routes returned: ' + respJson.routes.length)
        console.log(placesCount);
        let points = PLdecoder.decode(respJson.routes[0].overview_polyline.points);
        let alternativeCoords;
        if (respJson.routes[1]) {
            let altPoints = PLdecoder.decode(respJson.routes[1].overview_polyline.points);
            alternativeCoords = altPoints.map((point: any[]) => {
                return {
                    latitude: point[0],
                    longitude: point[1]
                }
            });
        }


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
        for (let category in categoryUtils) {
            if (categoryUtils[category as keyof object].isEssential) {
                requests.push(`https://api.tomtom.com/search/2/searchAlongRoute/${category}.json?maxDetourTime=1200&limit=20&&categorySet=${categoryUtils[category as keyof object].categorySet}&spreadingMode=auto&key=${TOMTOM_API_KEY}`);
            }
        }
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

        // Selecting amount of markers that is based on distance and preferences
        let slicedMarkers = sliceMarkers(locationMarkers, placesCount);

        // Putting all selected markers into one array
        let allSelectedMarkers: LocMarker[] = [];
        for (let category in slicedMarkers) {
            if (slicedMarkers.hasOwnProperty(category)) {
                slicedMarkers[category as keyof MarkerTypes]?.forEach(marker => allSelectedMarkers.push(marker));
            }
        }
        allSelectedMarkers.sort((marker1, marker2) => marker1.distFromDep - marker2.distFromDep);
        console.log('All selected length: ' + allSelectedMarkers.length)

        // formating markers locations to be inserted into TomTom calculateRoute URL
        const waypUrl = formatWaypString(allSelectedMarkers, points);
        // Calculating the route with places to visit and assigning it's coordinates to the coords state
        let waypRes = await fetch(`https://api.tomtom.com/routing/1/calculateRoute/${waypUrl}/json?computeBestOrder=false&avoid=unpavedRoads&key=${TOMTOM_API_KEY}`);
        let waypResJson = await waypRes.json();
        // let waypResJson = calculateRes;
        console.log(consoleString(waypResJson.routes[0].summary));
        const waypCoords = formatCoords(waypResJson);
        setInfoBar(createInfoBar(waypResJson.routes[0].summary));
        setMarkers(locationMarkers);
        setPlacesBody(placesReqBody);
        setDisplayedMarkers(slicedMarkers);
        setCoords(waypCoords);
        setAltCoords(alternativeCoords);
        setPoints(points);
        fitToCoordinates(waypCoords);
    };

    const recalculateRoute = async (points: [number, number]) => {
        let selectedMarkers: LocMarker[] = [];
        for (let category in displayedMarkers) {
            displayedMarkers[category as keyof MarkerTypes].forEach(marker => {
                if (marker.isSelected) selectedMarkers.push(marker);
            });
        }
        selectedMarkers!.sort((marker1, marker2) => marker1.distFromDep - marker2.distFromDep);
        const waypUrl = formatWaypString(selectedMarkers!, points);
        // Calculating the route with places to visit and assigning it's coordinates to the coords state
        let waypRes = await fetch(`https://api.tomtom.com/routing/1/calculateRoute/${waypUrl}/json?computeBestOrder=false&avoid=unpavedRoads&key=${TOMTOM_API_KEY}`);
        let waypResJson = await waypRes.json();
        console.log(consoleString(waypResJson.routes[0].summary));
        const waypCoords = formatCoords(waypResJson);
        setInfoBar(createInfoBar(waypResJson.routes[0].summary));
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
                    <PlacesForm
                        setArrival={setArrival}
                        setDeparture={setDeparture}
                        createRoute={createRoute}
                    />

                    <FilterBox
                        categoryUtils={categoryUtils}
                        setCategoryUtils={setCategoryUtils}
                        markers={markers}
                        placesBody={placesBody}
                        points={points}
                        setDisplayedMarkers={setDisplayedMarkers}
                    />

                    <MapView
                        lineDashPattern={[1]}
                        // optimizeWaypoints={true}
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
                            latitudeDelta: 5,
                            longitudeDelta: 5,
                        }}
                        style={styles.map}
                    >
                        {coords && <Polyline
                            style={{ zIndex: 100 }}
                            tappable
                            onPress={() => console.log('pressed')}
                            coordinates={coords}
                            strokeWidth={4}
                            strokeColor="red" />}
                        {altCoords && <Polyline
                            onPress={() => console.log('pressed')}
                            coordinates={altCoords}
                            strokeWidth={3}
                            strokeColor="gray" />}

                        {(() => {
                            let allMarkers: any = [];
                            let key = 0;
                            for (let category in displayedMarkers) {
                                if (displayedMarkers.hasOwnProperty(category)) {
                                    try {
                                        displayedMarkers[category as keyof MarkerTypes]?.forEach((marker: LocMarker) => {
                                            allMarkers.push(<MapMarker
                                                key={key}
                                                marker={marker}
                                                setClickedMarker={setClickedMarker}
                                                setInfoBar={setInfoBar}
                                            />);
                                            key++;
                                        });
                                    } catch (error) {
                                        continue;
                                    }
                                }
                            }
                            return allMarkers;
                        })()}
                    </MapView>
                    {infoBar.isShown && <InfoBox infoBar={infoBar} />}
                    {clickedMarker && <Box style={styles.buttonBubble}>
                        <MarkerBox
                            clickedMarker={clickedMarker}
                            setClickedMarker={setClickedMarker}
                            displayedMarkers={displayedMarkers}
                            setDisplayedMarkers={setDisplayedMarkers}
                            setRecalculateBtn={setRecalculateBtn}
                            recalculateBtn={recalculateBtn}
                            recalculateRoute={recalculateRoute}
                            points={points}
                        />
                    </Box>}
                </VStack>

            </ScrollView>
            {/* <Footer /> */}
        </Box>
    );
}
