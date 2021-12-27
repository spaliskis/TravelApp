import { LatLng } from 'react-native-maps';
import { GOOGLE_MAPS_API_KEY, TOMTOM_API_KEY } from '@env';

const createInfoBar = (summary: object): object => {
    const dayOfWeek = (day: number) => {
        switch (day) {
            case 1:
                return 'Pirmadienis'
            case 2:
                return 'Antradienis'
            case 3:
                return 'Trečiadienis'
            case 4:
                return 'Ketvirtadienis'
            case 5:
                return 'Penktadienis'
            case 6:
                return 'Šeštadienis'
            case 7:
                return 'Sekmadienis'
        }
        return '';
    }
    const hours = Math.floor(summary.travelTimeInSeconds / 3600) === 0 ? '' : `${Math.floor(summary.travelTimeInSeconds / 3600)} h `;
    const minutes = Math.floor(summary.travelTimeInSeconds / 60 % 60) === 0 ? '' : `${Math.floor(summary.travelTimeInSeconds / 60 % 60)} min `;
    const seconds = Math.floor(summary.travelTimeInSeconds % 60) === 0 ? '' : `${Math.floor(summary.travelTimeInSeconds % 60)} s`;
    const clock = (day: number, hours: any, minutes: any) => {
        const formatDay = dayOfWeek(day);
        const formatHours = hours < 10 ? `0${hours}` : `${hours}`;
        const formatMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
        return `${formatDay}, ${formatHours}:${formatMinutes}`;
    }

    return {
        isShown: true,
        distance: Math.round(summary.lengthInMeters / 1000 * 10) / 10,
        time: `${hours}${minutes}${seconds}`,
        depTime: clock(new Date(summary.departureTime).getDay(), new Date(summary.departureTime).getHours(), new Date(summary.departureTime).getMinutes()),
        arrTime: clock(new Date(summary.arrivalTime).getDay(), new Date(summary.arrivalTime).getHours(), new Date(summary.arrivalTime).getMinutes()),
    }
}

async function fitToCoordinates(mapRef: React.MutableRefObject<undefined>, coords: LatLng[]) {
    mapRef.current.fitToCoordinates(coords, {
        edgePadding: {
            top: 30,
            bottom: 30,
            right: 15,
            left: 15
        }
    });
}

const getPlaceDetails = async (title: string, address: string, latitude: number, longitude: number) => {
    let findRes;
    try {
        findRes = await fetch(`https://maps.googleapis.com/maps/api/place/findplacefromtext/json?&input=${title}&inputtype=textquery&locationbias=point:${latitude}, ${longitude}&key=${GOOGLE_MAPS_API_KEY}`);
    } catch (error) {
        console.log(error);
        return;
    }
    const findResJson = await findRes.json();
    if (!findResJson.candidates[0]) return 'ZERO_RESULTS';
    let detailsRes;
    try {
        detailsRes = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?language=lt&place_id=${findResJson.candidates[0].place_id}&key=${GOOGLE_MAPS_API_KEY}`);
    } catch (error) {
        console.log(error);
        return;
    }
    const detailsResJson = await detailsRes.json();
    return detailsResJson;
}

export { createInfoBar, fitToCoordinates, getPlaceDetails }