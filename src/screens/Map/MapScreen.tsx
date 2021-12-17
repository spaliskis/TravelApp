import React, { useState, useRef, useEffect } from 'react';
import { ScrollView, VStack, Box, Heading } from 'native-base';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import MapView, { Polyline, LatLng, Callout, Overlay } from 'react-native-maps';
import { RootStackParamList } from '../../types'
import Footer from '../../components/Footer';
import * as PLdecoder from '@mapbox/polyline';
import { GOOGLE_MAPS_API_KEY, TOMTOM_API_KEY } from '@env';
import { calcPlacesLimit, segmentRoute, createMarkers, formatWaypString, formatCoords, calculatePreferences, sliceMarkers, consoleString } from './functions/routeFunctions';
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
import { createRoute, calcAltRoute, recalculateRoute } from './functions/createRoute';


type Props = NativeStackScreenProps<RootStackParamList, 'Map'>;

export default function MapScreen({ navigation }: Props) {
    const mapRef = useRef();
    const [departure, setDeparture] = useState<string>('Vilnius');
    const [arrival, setArrival] = useState<string>('Klaipeda');
    const [coords, setCoords] = useState<LatLng[]>();
    const [altCoords, setAltCoords] = useState<LatLng[]>();
    const [altRes, setAltRes] = useState<object>();
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


    return (
        <Box flex={1} pt="7">
            <ScrollView>
                <StatusBar style="auto"></StatusBar>
                <VStack>
                    <Heading p="3">Pasirinkite maršrutą: </Heading>
                    <PlacesForm
                        setArrival={setArrival}
                        setDeparture={setDeparture}
                        createRoute={() => createRoute(departure, arrival, preferences, categoryUtils, setInfoBar, setMarkers, setPlacesBody, setDisplayedMarkers, setCoords, setAltCoords, setAltRes, setPoints, mapRef)}
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
                            onPress={() => calcAltRoute(coords, altCoords, altRes, preferences, categoryUtils, setInfoBar, setMarkers, setPlacesBody, setDisplayedMarkers, setCoords, setAltCoords, setPoints, mapRef)}
                            tappable
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
                            recalculateRoute={() => recalculateRoute(displayedMarkers, points, setInfoBar, setCoords, mapRef)}
                            points={points}
                        />
                    </Box>}
                </VStack>

            </ScrollView>
            {/* <Footer /> */}
        </Box>
    );
}
