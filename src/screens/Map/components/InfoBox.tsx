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
            <Text><Text bold>Atstumas: </Text>{props.infoBar.distance} km</Text>
            <Text><Text bold>Kelionės trukmė (važiavimo): </Text>{props.infoBar.time}</Text>
            <Text><Text bold>Kelionės pradžios laikas: </Text>{props.infoBar.depTime}</Text>
            <Text><Text bold>Kelionės pabaigos laikas: </Text>{props.infoBar.arrTime}</Text>
        </Box>
    );
}
