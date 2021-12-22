import React from 'react';
import { Box, Button, FormControl, Input, Image, Text } from 'native-base';
import styles from '../MapStyle';
import LocMarker from '../../../interfaces/LocMarker';

type BoxProps = {
    infoBar: object
}

export default function InfoBox(props: BoxProps) {

    return (
        <Box style={styles.buttonBubble}>
            <Text py={0.5} color={'#001a66'}><Text bold>Atstumas: </Text>{props.infoBar.distance} km</Text>
            <Text py={0.5} color={'#001a66'}><Text bold>Kelionės trukmė (važiavimo): </Text>{props.infoBar.time}</Text>
            <Text py={0.5} color={'#001a66'}><Text bold>Kelionės pradžios laikas: </Text>{props.infoBar.depTime}</Text>
            <Text py={0.5} color={'#001a66'}><Text bold>Kelionės pabaigos laikas: </Text>{props.infoBar.arrTime}</Text>
        </Box>
    );
}
