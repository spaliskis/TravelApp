import React, { useState } from 'react';
import { Box, Button, FormControl, Input, Image, Text } from 'native-base';
import styles from '../MapStyle';
import LocMarker from '../../../interfaces/LocMarker';
import { TouchableOpacity } from 'react-native';
import { Linking } from 'react-native';
import DialogBox from './DialogBox';
import {StyleSheet, Dimensions} from 'react-native';
const { width, height } = Dimensions.get('screen');


type BoxProps = {
    points: [number, number] | undefined,
    routeMarkers: LocMarker[] | undefined
}

export default function MapsLinkBox(props: BoxProps) {

    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const cancelRef = React.useRef(null);

    return (
        <Box style={styles.mapsLinkBox}>
            <TouchableOpacity
                style={styles.touchableDropdown}
                onPress={() => setDialogOpen(true)}>
                <Image
                    alt="mapsLink"
                    source={require('../../../assets/map.png')}
                    style={{ width: 28, height: 28 }}
                    resizeMode="contain"
                />
            </TouchableOpacity>

            <DialogBox
                header={'Maršruto peržiūra „Google Maps“'}
                body={'Patvirtinus šį veiksmą būsite nukelti į „Google Maps“ programėlę, kurioje galėsite peržiūrėti savo pasirinktą maršrutą. Ar to norite?'}
                cancelRef={cancelRef}
                dialogOpen={dialogOpen}
                setDialogOpen={setDialogOpen}
                function={() => {
                    if (props.routeMarkers.length === undefined) {
                        console.log('Routemarkers are undefined');
                    }
                    else {
                        let coordString = '';
                        coordString += `${props.points[0][0]},${props.points[0][1]}/`;
                        props.routeMarkers?.forEach(marker => {
                            coordString += `${marker.latitude},${marker.longitude}/`;
                        });
                        coordString += `${props.points[props.points.length - 1][0]},${props.points[props.points.length - 1][1]}/`;
                        console.log(coordString);
                        Linking.openURL(`https://www.google.lt/maps/dir/${coordString}`);
                    }
                }}
            />
        </Box>
    );
}
