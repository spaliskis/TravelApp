import React from 'react';
import { Image } from 'native-base';
import styles from '../MapStyle';

type IconProps = {
    category: string,
    isSelected: boolean,
    changeTrackView: () => void,
}

const ICONS = {
    touristAttraction: require('../../../assets/camera-pngrepo-com.png'),
    monument: require('../../../assets/statue-of-liberty-pngrepo-com.png'),
    museum: require('../../../assets/museum-pngrepo-com.png'),
    park: require('../../../assets/park-pngrepo-com.png'),
    restaurant: require('../../../assets/restaurant-pngrepo-com.png'),
    gasStation: require('../../../assets/gas-station-pngrepo-com.png'),
    evStation: require('../../../assets/electric-station-fuel-pngrepo-com.png'),
    hotel: require('../../../assets/hotel-pngrepo-com.png'),
};

export default function PlaceIcon(props: IconProps) {
    return (
        <Image
            onLoadEnd={props.changeTrackView}
            fadeDuration={0}
            alt="image"
            source={ICONS[props.category as keyof object]}
            style={props.isSelected ? styles.selectedMarker : styles.marker}
            resizeMode="contain"
        />
    );
}
