import React, { useState } from 'react';
import { Box } from 'native-base';
import styles from '../MapStyle';
import { Marker } from 'react-native-maps';
import PlaceIcon from './PlaceIcon';
import LocMarker from '../../../interfaces/LocMarker';

type MarkerProps = {
    marker: LocMarker,
    setClickedMarker: React.Dispatch<React.SetStateAction<LocMarker | undefined>>,
    setInfoBar: React.Dispatch<React.SetStateAction<object>>,
}

export default function MapMarker(props: MarkerProps) {

    const [trackView, setTrackView] = useState<boolean>(true);
    function changeTrackView() {
      setTrackView(false);
    }

    return (
        <Marker
            tracksViewChanges={trackView}
            coordinate={{ latitude: props.marker.latitude, longitude: props.marker.longitude }}
            onPress={() => {
                props.setClickedMarker(props.marker);
                props.setInfoBar(prevState => ({
                    ...prevState,
                    ['isShown']: false
                }));
            }}
        >
            <Box>
                {props.marker.isSelected && <Box style={styles.arrowUp} />}
                <PlaceIcon
                    changeTrackView={changeTrackView}
                    category={props.marker.image}
                    isSelected={props.marker.isSelected}
                />
            </Box>
        </Marker>
    );
}
