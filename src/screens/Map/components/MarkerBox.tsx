import React from 'react';
import { Box, Button, FormControl, Input, Image, Text, HStack } from 'native-base';
import styles from '../MapStyle';
import LocMarker from '../../../interfaces/LocMarker';
import MarkerTypes from '../../../interfaces/MarkerTypes';

type BoxProps = {
    clickedMarker: LocMarker,
    setClickedMarker: React.Dispatch<React.SetStateAction<LocMarker | undefined>>,
    displayedMarkers: MarkerTypes | undefined,
    setDisplayedMarkers: React.Dispatch<React.SetStateAction<MarkerTypes | undefined>>,
    setRecalculateBtn: React.Dispatch<React.SetStateAction<boolean | undefined>>,
    recalculateBtn: boolean | undefined,
    recalculateRoute: (points: [number, number]) => void,
    points: [number, number] | undefined,
}

export default function MarkerBox(props: BoxProps) {

    return (
        <HStack space={2}>
            <Box w={"65%"}>
                <Text bold>Pavadinimas: </Text><Text>{props.clickedMarker.title}</Text>
                <Text bold>Adresas: </Text><Text>{props.clickedMarker.address}</Text>
            </Box>
            <Box style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }} w={"35%"}>
                {props.clickedMarker.isSelected ?
                    <Button onPress={() => {
                        let category = props.clickedMarker.image;
                        let stateUpdate = Object.assign({}, props.displayedMarkers);
                        stateUpdate[category as keyof MarkerTypes]?.forEach(marker => {
                            if (marker.id === props.clickedMarker.id) marker.isSelected = false;
                        });

                        props.setDisplayedMarkers(stateUpdate);
                        props.setRecalculateBtn(true);
                    }} colorScheme="red">Išimti vietą</Button>
                    :
                    <Button onPress={() => {
                        let category = props.clickedMarker.image;
                        let stateUpdate = Object.assign({}, props.displayedMarkers);
                        stateUpdate![category as keyof MarkerTypes]?.forEach(marker => {
                            if (marker.id === props.clickedMarker.id) marker.isSelected = true;
                        });
                        props.setDisplayedMarkers(stateUpdate);
                        props.setRecalculateBtn(true);
                    }} colorScheme="green">Pridėti vietą</Button>}
                {props.recalculateBtn && <Button mt={2} onPress={async () => {
                    await props.recalculateRoute(props.points); props.setRecalculateBtn(false); props.setClickedMarker(undefined);
                }} colorScheme="pink">Perskaičiuoti</Button>}
            </Box>
        </HStack>
    );
}
