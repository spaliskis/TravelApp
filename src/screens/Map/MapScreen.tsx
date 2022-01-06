import React, { useState, useRef, useEffect } from 'react';
import { ScrollView, VStack, Box, Button, Text, Center } from 'native-base';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import MapView, { Polyline, LatLng, Callout, Overlay, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { RootStackParamList } from '../../types'
import LocMarker from '../../interfaces/LocMarker';
import MarkerTypes from '../../interfaces/MarkerTypes';
import Preferences from '../../interfaces/Preferences';
import categoryUtilsObj from './categoryUtils';
import styles from './MapStyle';
import PlacesForm from './components/PlacesForm';
import FilterBox from './components/FilterBox';
import MapMarker from './components/MapMarker'
import InfoBox from './components/InfoBox';
import MarkerBox from './components/MarkerBox';
import MapsLinkBox from './components/MapsLinkBox';
import DetailsBox from './components/DetailsBox';
import PreferencesBox from './components/PreferencesBox';
import DialogBox from './components/DialogBox';
import { AlertBox } from './components/AlertBox';
import { createRoute, calcAltRoute, recalculateRoute } from './functions/createRoute';
import { Animated, Dimensions, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';
const { width, height } = Dimensions.get('screen');


type Props = NativeStackScreenProps<RootStackParamList, 'Map'>;

const getPreferences = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem('@preferences')
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
        console.log(e);
    }
}

export default function MapScreen({ navigation }: Props) {

    const mapRef = useRef<MapView>();
    const [coords, setCoords] = useState<LatLng[]>();
    const [placesDensity, setPlacesDensity] = useState<number>(60000);
    const [altCoords, setAltCoords] = useState<LatLng[]>();
    const [altRes, setAltRes] = useState<object>();
    const [points, setPoints] = useState<[number, number]>();
    const [clickedMarker, setClickedMarker] = useState<LocMarker>();
    const [recalculateBtn, setRecalculateBtn] = useState<boolean>();
    const [markers, setMarkers] = useState<MarkerTypes>();
    const [displayedMarkers, setDisplayedMarkers] = useState<LocMarker[]>([]);
    const markerRef = useRef<Marker[]>([]);
    const [routeMarkers, setRouteMarkers] = useState<LocMarker[]>();
    const [placesBody, setPlacesBody] = useState<object>();
    const [placeDetails, setPlaceDetails] = useState<object>();
    const [categoryUtils, setCategoryUtils] = useState<object>(categoryUtilsObj);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const cancelRef = React.useRef(null);
    const [dialogOpen, setDialogOpen] = useState<boolean>();
    const [infoBar, setInfoBar] = useState<object>({
        isShown: false,
        distance: 0,
    });
    const [preferences, setPreferences] = useState<Preferences>({
        touristAttraction: 1,
        monument: 1,
        museum: 1,
        park: 1,
    });
    const [prefChosen, setPrefChosen] = useState<boolean>(true);
    const [error, setError] = useState<string>();

    markerRef.current = [];

    useEffect(() => {
        async function storage() {
            const prefs = await getPreferences();
            if (prefs === null) setPrefChosen(false);
            else {
                setPreferences(prefs);
                setPrefChosen(true);
            }
        }
        storage();
    }, []);

    useEffect(() => {
        const findDisplayed: LocMarker[] = [];
        for (let category in markers) {
            if (markers.hasOwnProperty(category)) {
                try {
                    markers[category as keyof MarkerTypes]?.forEach((marker: LocMarker) => {
                        if (marker.isDisplayed) {
                            findDisplayed.push(marker);
                        }
                    });
                } catch (error) {
                    continue;
                }
            }
        }
        setDisplayedMarkers(findDisplayed);
    }, [markers, clickedMarker])

    return (
        <Box flex={1} pt="8">
            <StatusBar style="auto"></StatusBar>
            {!prefChosen ?
                <PreferencesBox
                    preferences={preferences}
                    setPreferences={setPreferences}
                    setPrefChosen={setPrefChosen}
                    placesDensity={placesDensity}
                    setPlacesDensity={setPlacesDensity}
                />
                :
                <VStack flex={1}>
                    {recalculateBtn && <Button
                        leftIcon={<FontAwesome5 name="redo" size={16} color="#FFF" />}
                        _pressed={{ bg: '#6c0058' }}
                        bg={'#a50086'}
                        isLoading={isLoading}
                        style={styles.recBtn} mt={2} onPress={async () => {
                            setIsLoading(true);
                            await recalculateRoute(points, markers, setRouteMarkers, setInfoBar, setCoords, mapRef);
                            setRecalculateBtn(false);
                            setClickedMarker(undefined);
                            setIsLoading(false);
                        }}>Perskaičiuoti</Button>}
                    <DialogBox
                        header={'Alternatyvus maršrutas'}
                        body={'Patvirtinus šį veiksmą bus pasirinktas alternatyvus maršrutas ir lankomi objektai bus ieškomi pagal jį. Ar to norite?'}
                        isLoading={isLoading}
                        setIsLoading={setIsLoading}
                        cancelRef={cancelRef}
                        dialogOpen={dialogOpen}
                        setDialogOpen={setDialogOpen}
                        function={async () => {
                            setIsLoading(true);
                            await calcAltRoute(coords, altCoords, altRes, preferences, categoryUtils, setInfoBar, setMarkers, setRouteMarkers, setPlacesBody, setCoords, setAltCoords, setPoints, mapRef, placesDensity);
                            setIsLoading(false);
                            setRecalculateBtn(false);
                            setClickedMarker(undefined);
                        }}
                    />

                    <Box flex={1}>
                        <Center backgroundColor={'#FFF'} p={3} borderBottomWidth={4} borderBottomColor={'#001a66'}>
                            <Text fontSize={'2xl'} color={'#001a66'} pb={2} bold>Pasirinkite maršrutą: </Text>
                            <PlacesForm
                                createRoute={async (departure, arrival) => {
                                    let resp = await createRoute(departure, arrival, preferences, categoryUtils, setInfoBar, setMarkers, setRouteMarkers, setPlacesBody, setCoords, setAltCoords, setAltRes, setPoints, mapRef, placesDensity);
                                    if (resp === 'error') setError('Maršrutas neegizstuoja, patikrinkite įvesties laukelius. Vesti galima vietų pavadinimus, adresus ir koordinates.');
                                }}
                                isLoading={isLoading}
                                setIsLoading={setIsLoading}
                                setClickedMarker={setClickedMarker}
                            />
                        </Center>
                        {placeDetails && <DetailsBox
                            clickedMarker={clickedMarker}
                            placeDetails={placeDetails}
                            setPlaceDetails={setPlaceDetails}
                        />}
                        <Box flex={1}>
                            <Box style={styles.navButtons}>
                                {markers &&
                                    <FilterBox
                                        categoryUtils={categoryUtils}
                                        setCategoryUtils={setCategoryUtils}
                                        markers={markers}
                                        placesBody={placesBody}
                                        points={points}
                                        setMarkers={setMarkers}
                                    />}
                                {markers && <MapsLinkBox
                                    points={points}
                                    routeMarkers={routeMarkers}
                                />}
                                <TouchableOpacity
                                    style={[styles.prefBtn, styles.touchableDropdown]}
                                    onPress={() => { setPrefChosen(false) }}>
                                    <FontAwesome name="tasks" size={width * 0.07} color="#001a66" />
                                </TouchableOpacity>
                            </Box>
                            <MapView
                                provider={PROVIDER_GOOGLE}
                                lineDashPattern={[0]}
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
                                    latitude: 55.263789,
                                    longitude: 23.986982,
                                    latitudeDelta: 4.9,
                                    longitudeDelta: 4.9,
                                }}
                                style={StyleSheet.absoluteFill}
                            // style={clickedMarker || infoBar.isShown ? {
                            //     width: Dimensions.get('screen').width,
                            //     height: Dimensions.get('screen').height * 0.5
                            // } : {
                            //     width: Dimensions.get('screen').width,
                            //     height: Dimensions.get('screen').height * 0.7
                            // }}
                            >
                                {coords && <Polyline
                                    lineDashPattern={[0]}
                                    zIndex={1}
                                    tappable
                                    onPress={() => console.log('pressed')}
                                    coordinates={coords}
                                    strokeWidth={5}
                                    strokeColor="red" />}
                                {altCoords && <Polyline
                                    lineDashPattern={[0]}
                                    onPress={async () => setDialogOpen(true)}
                                    tappable
                                    coordinates={altCoords}
                                    strokeWidth={3}
                                    strokeColor="gray" />}

                                {(() => {
                                    let markerComponents: JSX.Element[] = [];
                                    displayedMarkers.sort((marker1, marker2) => marker1.longitude - marker2.longitude)
                                        .forEach(marker => {
                                            markerComponents.push(<MapMarker
                                                key={marker.id}
                                                mapRef={mapRef}
                                                markerRef={markerRef}
                                                marker={marker}
                                                displayedMarkers={displayedMarkers}
                                                setDisplayedMarkers={setDisplayedMarkers}
                                                setClickedMarker={setClickedMarker}
                                                setInfoBar={setInfoBar}
                                            />);
                                        });
                                    return markerComponents;
                                })()}

                            </MapView>
                        </Box>
                    </Box>


                    {infoBar.isShown && <InfoBox infoBar={infoBar} />}
                    {clickedMarker && <Box style={styles.buttonBubble}>
                        <MarkerBox
                            clickedMarker={clickedMarker}
                            markers={markers}
                            markerRef={markerRef}
                            displayedMarkers={displayedMarkers}
                            setMarkers={setMarkers}
                            setClickedMarker={setClickedMarker}
                            setRecalculateBtn={setRecalculateBtn}
                            recalculateBtn={recalculateBtn}
                            recalculateRoute={() => recalculateRoute(points, markers, setRouteMarkers, setInfoBar, setCoords, mapRef)}
                            points={points}
                            setPlaceDetails={setPlaceDetails}
                        />
                    </Box>}
                </VStack>
            }
            {error && <AlertBox
                status="error"
                title={error}
                setError={setError}
            />}
        </Box >
    );
}
