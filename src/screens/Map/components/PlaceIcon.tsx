import React from 'react';
import { Image } from 'native-base';
import styles from '../MapStyle';
import LocMarker from '../../../interfaces/LocMarker';

type IconProps = {
    category: string,
    isSelected?: boolean,
    changeTrackView: () => void,
}

export default function PlaceIcon(props: IconProps) {

    return (
        <Image
            onLoadEnd={props.changeTrackView}
            fadeDuration={0}
            alt="image"
            source={(function () {
                switch (props.category) {
                    case 'restaurant':
                        return require('../../../assets/restaurant-pngrepo-com.png');
                    case 'touristAttraction':
                        return require('../../../assets/camera-pngrepo-com.png');
                    case 'monument':
                        return require('../../../assets/statue-of-liberty-pngrepo-com.png');
                    case 'museum':
                        return require('../../../assets/museum-pngrepo-com.png');
                    case 'park':
                        return require('../../../assets/park-pngrepo-com.png')
                    case 'gasStation':
                        return require('../../../assets/gas-station-pngrepo-com.png')
                    case 'evStation':
                        return require('../../../assets/electric-station-fuel-pngrepo-com.png')
                    case 'hotel':
                        return require('../../../assets/hotel-pngrepo-com.png')
                }
            }
            )()}
            style={props.isSelected ? styles.selectedMarker : styles.marker}
            resizeMode="contain"
        />
    );
}
