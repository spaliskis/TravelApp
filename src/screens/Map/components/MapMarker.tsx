import React, { useState } from 'react';
import { Box, Image } from 'native-base';
import styles from '../MapStyle';
import MapView, { Marker } from 'react-native-maps';
import PlaceIcon from './PlaceIcon';
import LocMarker from '../../../interfaces/LocMarker';

type MarkerProps = {
    marker: LocMarker,
    mapRef: React.MutableRefObject<MapView | undefined>,
    // setMapLatLng: React.Dispatch<React.SetStateAction<LatLng>>,
    markerRef: React.MutableRefObject<Marker[]>,
    displayedMarkers: LocMarker[],
    setDisplayedMarkers: React.Dispatch<React.SetStateAction<LocMarker[]>>,
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
            style={props.marker.isClicked && { zIndex: 1 }}
            tracksViewChanges={trackView}
            coordinate={{ latitude: props.marker.latitude, longitude: props.marker.longitude }}
            ref={el => {
                if (el === null) return;
                props.markerRef.current.push(el)
            }}
            onPress={() => {
                // console.log(`clicked marker: ${JSON.stringify(props.marker)}`)
                props.setClickedMarker(props.marker);
                let updateState = [...props.displayedMarkers];
                updateState.forEach(marker => {
                    if (marker.id === props.marker.id) marker.isClicked = true;
                    else marker.isClicked = false;
                });
                props.setDisplayedMarkers(updateState);
                props.mapRef.current?.animateCamera({
                    center: {
                        latitude: props.marker.latitude,
                        longitude: props.marker.longitude
                    }
                });
                props.setInfoBar(prevState => ({
                    ...prevState,
                    ['isShown']: false
                }));
            }}
        >
            <Box style={props.marker.isClicked && {}}>
                {props.marker.isSelected && <Box style={styles.arrowUp} />}
                <PlaceIcon
                    category={props.marker.image}
                    isClicked={props.marker.isClicked}
                    isSelected={props.marker.isSelected}
                    changeTrackView={changeTrackView}
                />
            </Box>
        </Marker>
    );
}
