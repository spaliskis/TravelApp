import React from 'react';
import { Box, Button, FormControl, Input, Image, Text, HStack } from 'native-base';
import styles from '../MapStyle';
import LocMarker from '../../../interfaces/LocMarker';
import MarkerTypes from '../../../interfaces/MarkerTypes';
import { GOOGLE_MAPS_API_KEY, TOMTOM_API_KEY } from '@env';
import { getPlaceDetails } from '../functions/utilFunctions';
import { FontAwesome } from '@expo/vector-icons';

type BoxProps = {
    clickedMarker: LocMarker,
    markers: MarkerTypes | undefined,
    setMarkers: React.Dispatch<React.SetStateAction<MarkerTypes | undefined>>,
    setClickedMarker: React.Dispatch<React.SetStateAction<LocMarker | undefined>>,
    setRecalculateBtn: React.Dispatch<React.SetStateAction<boolean | undefined>>,
    recalculateBtn: boolean | undefined,
    recalculateRoute: () => Promise<void>,
    points: [number, number] | undefined,
    setPlaceDetails: React.Dispatch<React.SetStateAction<object | undefined>>
}

export default function MarkerBox(props: BoxProps) {
    // console.log(props.clickedMarker)
    return (
        <Box>
            <HStack space={2}>
                <Box w={"65%"}>
                    <Text py={0.5} color={'#001a66'} bold>Pavadinimas: </Text><Text>{props.clickedMarker.title}</Text>
                    <Text py={0.5} color={'#001a66'} bold>Adresas: </Text><Text>{props.clickedMarker.address}</Text>
                </Box>
                <Box style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }} w={"35%"}>
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
                    {props.clickedMarker.fsqId && <Button
                        leftIcon={<FontAwesome name="info" size={16} color="#FFF" />}
                        _pressed={{ bg: '#474700' }}
                        bg={'#666600'}
                        style={{ marginTop: 8 }}
                        onPress={async () => {
                            let details = await getPlaceDetails(props.clickedMarker.fsqId!);
                            props.setPlaceDetails(details);
                        }}
                    >Daugiau info</Button>}
                </Box>
            </HStack>
        </Box>
    );
}
