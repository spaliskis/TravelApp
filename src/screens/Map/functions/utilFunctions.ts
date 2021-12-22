import { LatLng } from 'react-native-maps';
import { GOOGLE_MAPS_API_KEY, TOMTOM_API_KEY } from '@env';

const createInfoBar = (summary: object): object => {
    return {
        isShown: true,
        distance: Math.round(summary.lengthInMeters / 1000 * 10) / 10,
        time: `${Math.floor(summary.travelTimeInSeconds / 3600)} h ${Math.floor(summary.travelTimeInSeconds / 60 % 60)} min ${Math.floor(summary.travelTimeInSeconds % 60)} s`,
        depTime: String(`${new Date(summary.departureTime).getHours()}:${new Date(summary.departureTime).getMinutes()}`),
        arrTime: String(`${new Date(summary.arrivalTime).getHours()}:${new Date(summary.arrivalTime).getMinutes()}`),
    }
}

async function fitToCoordinates(mapRef: React.MutableRefObject<undefined>, coords: LatLng[]) {
    mapRef.current.fitToCoordinates(coords, {
        edgePadding: {
            top: 20,
            bottom: 20,
            right: 15,
            left: 15
        }
    });
}

const getPlaceDetails = async (fsqId: string) => {
    let res = await fetch(`https://api.tomtom.com/search/2/poiDetails.json?key=${TOMTOM_API_KEY}&id=${fsqId}`);
    let resJson = await res.json();
    return resJson;
}

export { createInfoBar, fitToCoordinates, getPlaceDetails }