import React, { useState } from 'react';
import { Box, Button, FormControl, Input, Image, ScrollView, Checkbox } from 'native-base';
import { TouchableOpacity } from 'react-native';
import styles from '../MapStyle';
import MarkerTypes from '../../../interfaces/MarkerTypes';
import { TOMTOM_API_KEY } from '@env';
import { createMarker } from '../functions/routeFunctions';
import PlaceIcon from './PlaceIcon';

type FilterBoxProps = {
    categoryUtils: object,
    setCategoryUtils: (value: React.SetStateAction<object>) => void,
    markers: MarkerTypes | undefined,
    placesBody: object | undefined,
    points: [number, number] | undefined,
    setDisplayedMarkers: React.Dispatch<React.SetStateAction<MarkerTypes | undefined>>,
}

export default function FilterBox(props: FilterBoxProps) {

    const [dropdownDisplay, setDropdownDisplay] = useState<boolean>(false);

    return (
        <Box style={styles.filterBox}>
        <ScrollView>
            <TouchableOpacity
                style={styles.touchableDropdown}
                onPress={() => setDropdownDisplay((prevState) => !prevState)}>
                <Image
                    alt="categorySelector"
                    source={require('../../../assets/menu-button-of-three-horizontal-lines-pngrepo-com.png')}
                    style={styles.marker}
                    resizeMode="contain"
                />
            </TouchableOpacity>
            {dropdownDisplay &&
                <Box style={styles.dropdown}>
                    {(() => {
                        let boxes = [];
                        let key = 0;
                        for (let category in props.categoryUtils) {
                            boxes.push(
                                <Box key={key} style={styles.filterRow}>
                                    <Box style={{ display: 'flex', flexDirection: 'row' }}>
                                        <Checkbox isChecked={props.categoryUtils[category as keyof object].display} onChange={() => {
                                            let updateState = Object.assign({}, props.categoryUtils);
                                            updateState[category as keyof object].display = !updateState[category as keyof object].display;
                                            props.setCategoryUtils(updateState);
                                        }} value={props.categoryUtils[category as keyof object].name} colorScheme="green">{props.categoryUtils[category as keyof object].name}</Checkbox>
                                        <PlaceIcon
                                            category={category}
                                        />
                                    </Box>
                                </Box>
                            );
                            key++;
                        }
                        return boxes;
                    })()}
                    <Button onPress={async () => {
                        for (let category in props.categoryUtils) {
                            if (props.categoryUtils[category as keyof object].display) {
                                if (!props.markers) break;
                                if (props.markers[category as keyof MarkerTypes]?.length === 0) {
                                    let url = `https://api.tomtom.com/search/2/searchAlongRoute/${category}.json?maxDetourTime=1200&limit=20&categorySet=${props.categoryUtils[category as keyof object].categorySet}&spreadingMode=auto&key=${TOMTOM_API_KEY}`;
                                    let res = await fetch(url, {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify(props.placesBody),
                                    })
                                    let resJson = await res.json();
                                    createMarker(resJson, category, props.points, props.markers[category as keyof object]);
                                }
                                props.setDisplayedMarkers((prevState: any) => {
                                    return {
                                        ...prevState, [category]: props.markers[category as keyof MarkerTypes]
                                    };
                                });
                            }
                            else {
                                let filteredMarkers: any;
                                try {
                                    filteredMarkers = Object.assign({}, props.markers)[category as keyof MarkerTypes]!.filter(marker => marker.isSelected);
                                } catch (error) {
                                    continue;
                                }
                                props.setDisplayedMarkers((prevState: any) => {
                                    return { ...prevState, [category]: filteredMarkers };
                                });
                            }
                        }
                    }}>Rodyti</Button>
                </Box>}
        </ScrollView>
    </Box>
    );
}
