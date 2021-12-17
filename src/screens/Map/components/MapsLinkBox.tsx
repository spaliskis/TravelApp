import React from 'react';
import { Box, Button, FormControl, Input, Image, Text } from 'native-base';
import styles from '../MapStyle';
import LocMarker from '../../../interfaces/LocMarker';
import { TouchableOpacity } from 'react-native';
import { Linking } from 'react-native';


type BoxProps = {
    points: [number, number] | undefined,
    routeMarkers: LocMarker[] | undefined
}

export default function MapsLinkBox(props: BoxProps) {

    return (
        <Box style={styles.mapsLinkBox}>S
            <TouchableOpacity
                style={styles.touchableDropdown}
                onPress={() => {
                    console.log(props.routeMarkers.length)
                    if(props.routeMarkers.length === undefined) {
                        console.log('Routemarkers are undefined');
                    }
                    else {
                        console.log(props.routeMarkers.length);
                        let coordString = '';
                        coordString += `${props.points[0][0]},${props.points[0][1]}/`;
                        props.routeMarkers?.forEach(marker => {
                            coordString += `${marker.latitude},${marker.longitude}/`;
                        });
                        coordString += `${props.points[props.points.length-1][0]},${props.points[props.points.length-1][1]}/`;
                        console.log(coordString);
                        Linking.openURL(`https://www.google.lt/maps/dir/${coordString}`);
                    }
                }}>
                <Image
                    alt="mapsLink"
                    source={require('../../../assets/map.png')}
                    style={styles.marker}
                    resizeMode="contain"
                />
            </TouchableOpacity>
        </Box>
    );
}
