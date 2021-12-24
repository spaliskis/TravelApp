import React, { useState, useRef } from 'react';
import { Box, Button, FormControl, Input, Image, ScrollView, Checkbox, Text } from 'native-base';
import { TouchableOpacity, Animated } from 'react-native';
import styles from '../MapStyle';
import MarkerTypes from '../../../interfaces/MarkerTypes';
import { TOMTOM_API_KEY } from '@env';
import { createMarker } from '../functions/routeFunctions';
import PlaceIcon from './PlaceIcon';
import { FontAwesome } from '@expo/vector-icons';

type FilterBoxProps = {
    categoryUtils: object,
    setCategoryUtils: (value: React.SetStateAction<object>) => void,
    markers: MarkerTypes | undefined,
    setMarkers: React.Dispatch<React.SetStateAction<MarkerTypes | undefined>>,
    placesBody: object | undefined,
    points: [number, number] | undefined,
}

export default function FilterBox(props: FilterBoxProps) {

    const [dropdownDisplay, setDropdownDisplay] = useState<boolean>(false);

    return (
        <Box>
            <Box style={dropdownDisplay ? { display: 'none' } : styles.filterBox}>
                <TouchableOpacity
                    style={styles.touchableDropdown}
                    onPress={() => {setDropdownDisplay((prevState) => !prevState)}}>
                    <FontAwesome name="filter" size={28} color="#001a66" />
                </TouchableOpacity>
            </Box>
            {dropdownDisplay &&
                <Box style={styles.dropdown}>
                    <TouchableOpacity
                        style={styles.filterRow}
                        onPress={() => setDropdownDisplay((prevState) => !prevState)}>
                        <FontAwesome name="arrow-right" size={28} color="#001a66" />
                    </TouchableOpacity>
                    <ScrollView persistentScrollbar style={{ marginVertical: 10 }}>
                        {(() => {
                            let boxes = [];
                            let key = 0;
                            for (let category in props.categoryUtils) {
                                boxes.push(
                                    <Box key={key} style={styles.filterRow}>
                                        <Box style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
                                            <PlaceIcon
                                                category={category}
                                            />
                                            <Text color={'#001a66'} fontSize={'lg'} px={3}>{props.categoryUtils[category as keyof object].name}</Text>
                                            <Checkbox
                                                _checked={{ value: 'checked', backgroundColor: '#088800', color: '#FFF' }}
                                                accessibilityLabel={props.categoryUtils[category as keyof object].name}
                                                isChecked={props.categoryUtils[category as keyof object].display} onChange={() => {
                                                    let updateState = Object.assign({}, props.categoryUtils);
                                                    updateState[category as keyof object].display = !updateState[category as keyof object].display;
                                                    props.setCategoryUtils(updateState);
                                                }} value={props.categoryUtils[category as keyof object].name} ></Checkbox>
                                        </Box>
                                    </Box>
                                );
                                key++;
                            }
                            return boxes;
                        })()}
                    </ScrollView>
                    <Button
                        size={'lg'}
                        style={{ alignSelf: 'flex-end' }}
                        _pressed={{ bg: '#474700' }}
                        bg={'#666600'}
                        leftIcon={<FontAwesome name="eye" size={16} color="#FFF" />}
                        onPress={async () => {
                            let updateState = Object.assign({}, props.markers);
                            for (let category in props.categoryUtils) {
                                if (props.categoryUtils[category as keyof object].display) {
                                    if (!props.markers) break;
                                    if (updateState[category as keyof MarkerTypes]?.length === 0) {
                                        let url = `https://api.tomtom.com/search/2/searchAlongRoute/${category}.json?maxDetourTime=1200&limit=20&categorySet=${props.categoryUtils[category as keyof object].categorySet}&spreadingMode=auto&key=${TOMTOM_API_KEY}`;
                                        let res = await fetch(url, {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json'
                                            },
                                            body: JSON.stringify(props.placesBody),
                                        })
                                        let resJson = await res.json();
                                        createMarker(resJson, category, props.points, updateState[category as keyof object]);
                                    }
                                    updateState[category as keyof MarkerTypes]?.forEach(marker => marker.isDisplayed = true);
                                }
                                else {
                                    updateState[category as keyof MarkerTypes]?.forEach(marker => {
                                        if (!marker.isSelected) {
                                            marker.isDisplayed = false;
                                        }
                                    });
                                }
                            }
                            props.setMarkers(updateState);
                            setDropdownDisplay(false);
                        }}>Rodyti</Button>
                </Box>}
        </Box>
    );
}
