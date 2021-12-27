import React, { useState } from 'react';
import { Box, Button, FormControl, Input, Image, Text, HStack } from 'native-base';
import styles from '../MapStyle';
import LocMarker from '../../../interfaces/LocMarker';
import MarkerTypes from '../../../interfaces/MarkerTypes';
import { GOOGLE_MAPS_API_KEY, TOMTOM_API_KEY } from '@env';
import { getPlaceDetails } from '../functions/utilFunctions';
import { FontAwesome } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { Marker } from 'react-native-maps';

type BoxProps = {
    clickedMarker: LocMarker,
    markers: MarkerTypes | undefined,
    markerRef: React.MutableRefObject<Marker[]>,
    displayedMarkers: LocMarker[],
    setMarkers: React.Dispatch<React.SetStateAction<MarkerTypes | undefined>>,
    setClickedMarker: React.Dispatch<React.SetStateAction<LocMarker | undefined>>,
    setRecalculateBtn: React.Dispatch<React.SetStateAction<boolean | undefined>>,
    recalculateBtn: boolean | undefined,
    recalculateRoute: () => Promise<void>,
    points: [number, number] | undefined,
    setPlaceDetails: React.Dispatch<React.SetStateAction<object | undefined>>
}

export default function MarkerBox(props: BoxProps) {
    // console.info(props.clickedMarker)
    const [infoLoading, setInfoLoading] = useState<boolean>(false);
    const markerIndex = props.displayedMarkers.indexOf(props.clickedMarker);
    return (
        <Box>
            <HStack space={2}>
                <Box w={"65%"}>
                    <Text py={0.5} color={'#001a66'} bold>Pavadinimas: </Text><Text>{props.clickedMarker.title}</Text>
                    <Text py={0.5} color={'#001a66'} bold>Adresas: </Text><Text>{props.clickedMarker.address}</Text>
                </Box>
                <Box style={{ flex: 1, flexDirection: 'column', justifyContent: 'flex-start' }} w={"35%"}>
                    <Box style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', marginBottom: 8 }}>
                        <TouchableOpacity disabled={!props.displayedMarkers[markerIndex - 1] ? true : false}
                            onPress={() => {
                                props.setPlaceDetails(undefined);
                                props.markerRef.current[markerIndex - 1].props.onPress();
                            }}><FontAwesome name="arrow-left" size={24} color={!props.displayedMarkers[markerIndex - 1] ? '#A3A3A3' : '#001a66'} />
                        </TouchableOpacity>
                        <TouchableOpacity disabled={!props.displayedMarkers[props.displayedMarkers.indexOf(props.clickedMarker) + 1] ? true : false}
                            onPress={() => {
                                props.setPlaceDetails(undefined);
                                props.markerRef.current[markerIndex + 1].props.onPress();
                            }}><FontAwesome name="arrow-right" size={24} color={!props.displayedMarkers[markerIndex + 1] ? '#A3A3A3' : '#001a66'} /></TouchableOpacity>
                    </Box>
                    {props.clickedMarker.isSelected ?
                        <Button
                            leftIcon={<FontAwesome name="remove" size={16} color="#FFF" />}
                            _pressed={{ bg: '#660000' }}
                            bg={'#9d0000'}
                            onPress={() => {
                                let category = props.clickedMarker.image;
                                let updateState = Object.assign({}, props.markers);
                                updateState[category as keyof MarkerTypes]?.forEach(marker => {
                                    if (marker.id === props.clickedMarker.id) marker.isSelected = false;
                                })
                                props.setMarkers(updateState);
                                props.setRecalculateBtn(true);
                            }}>Išimti vietą</Button>
                        :
                        <Button
                            leftIcon={<FontAwesome name="plus" size={16} color="#FFF" />}
                            _pressed={{ bg: '#065f00' }}
                            bg={'#088800'}
                            onPress={() => {
                                let category = props.clickedMarker.image;
                                let updateState = Object.assign({}, props.markers);
                                updateState[category as keyof MarkerTypes]?.forEach(marker => {
                                    if (marker.id === props.clickedMarker.id) marker.isSelected = true;
                                });
                                props.setMarkers(updateState);
                                props.setRecalculateBtn(true);
                            }}>Pridėti vietą</Button>}
                    <Button
                        isLoading={infoLoading}
                        leftIcon={<FontAwesome name="info" size={16} color="#FFF" />}
                        _pressed={{ bg: '#474700' }}
                        bg={'#666600'}
                        style={{ marginTop: 8 }}
                        onPress={async () => {
                            setInfoLoading(true);
                            let details = await getPlaceDetails(props.clickedMarker.title, props.clickedMarker.address, props.clickedMarker.latitude, props.clickedMarker.longitude);
                            props.setPlaceDetails(details);
                            setInfoLoading(false);
                        }}
                    >Daugiau info</Button>
                </Box>
            </HStack>
        </Box>
    );
}
