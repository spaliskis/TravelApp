import { LatLng } from 'react-native-maps';
import { Marker } from 'react-native-svg';
import LocMarker from '../../../interfaces/LocMarker';
import MarkerTypes from '../../../interfaces/MarkerTypes';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

const calcPlacesLimit = (route: any, divider: number) => {
    let dirAPIdistance = 0;
    route.legs.forEach((leg: object) => {
        dirAPIdistance += leg.distance.value;
    });
    const placesLimit = Math.ceil(dirAPIdistance / divider);
    return placesLimit;
}

const calculatePreferences = (preferences: object, placesLimit: number) => {
    const totalMarks = preferences.museum + preferences.park + preferences.monument + preferences.touristAttraction;
    if (totalMarks === 0) return 0;
    const multiplier = placesLimit / totalMarks;
    const placesCount = {
        touristAttraction: Math.round(preferences.touristAttraction * multiplier),
        monument: Math.round(preferences.monument * multiplier),
        museum: Math.round(preferences.museum * multiplier),
        park: Math.round(preferences.park * multiplier),
    }
    return placesCount;
};

const segmentRoute = (coordinates: any, points: any) => {
    for (let i = 0; i < coordinates.length; i += 10) {
        if (distance(points[0][0], points[0][1], coordinates[i].lat, coordinates[i].lon) > 10) {
            coordinates.splice(0, i);
            break;
        }
    }
    for (let i = coordinates.length - 1; i >= 0; i -= 10) {
        if (distance(points[points.length - 1][0], points[points.length - 1][1], coordinates[i].lat, coordinates[i].lon) > 10) {
            coordinates.splice(i, coordinates.length);
            break;
        }
    }
}

const createMarker = (response: any, category: string, points: any, markerArr: Array<LocMarker>, markers: MarkerTypes) => {
    for (let i = 0; i < response.results.length; i++) {
        let isUnique = true;
        for (let type in markers) {
            markers[type as keyof MarkerTypes]?.forEach(marker => {
                if (marker.latitude === response.results[i].position.lat) isUnique = false;

            });
        }
        if (!isUnique) continue;
        const distFromDep = distance(points[0][0], points[0][1], response.results[i].position.lat, response.results[i].position.lon);
        const marker: LocMarker = {
            id: uuidv4(),
            latitude: response.results[i].position.lat,
            longitude: response.results[i].position.lon,
            title: response.results[i].poi.name,
            address: response.results[i].address.freeformAddress,
            image: category,
            distFromDep,
            isDisplayed: false,
            isSelected: false,
            isClicked: false,
        }
        markerArr.push(marker);
    }
}

const createMarkers = (data: any, points: any, markers: MarkerTypes) => {
    try {
        data.forEach((response: any) => {
            switch (response.summary.query) {
                case 'museum':
                    createMarker(response, 'museum', points, markers.museum, markers);
                    break;

                case 'monument':
                    createMarker(response, 'monument', points, markers.monument, markers);
                    break;

                case 'touristattraction':
                    createMarker(response, 'touristAttraction', points, markers.touristAttraction, markers);
                    break;

                case 'park':
                    createMarker(response, 'park', points, markers.park, markers);
                    break;
            }
        });
    } catch (error) {
        console.log('createMarkers error: ' + error)
    }
}

const formatWaypString = (markers: Array<LocMarker>, points: any) => {
    let waypointsArr = markers.map(marker => {
        return `${marker.latitude}%2C${marker.longitude}`
    });
    waypointsArr.unshift(`${points[0][0]}%2C${points[0][1]}`);
    waypointsArr.push(`${points[points.length - 1][0]}%2C${points[points.length - 1][1]}`);
    let waypointsURL = waypointsArr.join('%3A');
    return waypointsURL;
}

const formatCoords = (waypResJson: any) => {
    let waypCoords: Array<LatLng> = [];
    waypResJson.routes[0].legs.forEach((leg: any) => {
        for (let point of leg.points) {
            waypCoords.push({
                latitude: point.latitude,
                longitude: point.longitude
            })
        }
    });
    return waypCoords;
}

const distance = (depLat: number, depLon: number, markerLat: number, markerLon: number) => {
    depLat = depLat * Math.PI / 180;
    depLon = depLon * Math.PI / 180;
    markerLat = markerLat * Math.PI / 180;
    markerLon = markerLon * Math.PI / 180;
    // Haversine formula
    let dlon = markerLon - depLon;
    let dlat = markerLat - depLat;
    let a = Math.pow(Math.sin(dlat / 2), 2)
        + Math.cos(depLat) * Math.cos(markerLat)
        * Math.pow(Math.sin(dlon / 2), 2);

    let c = 2 * Math.asin(Math.sqrt(a));

    // Radius of earth in kilometers. Use 3956
    // for miles
    let r = 6371;

    // calculate the result
    return (c * r);
}

const sliceMarkers = (locationMarkers: MarkerTypes, placesCount: any) => {
    let selectedCount = {
        touristAttraction: 0,
        monument: 0,
        museum: 0,
        park: 0
    }

    for (let category in locationMarkers) {
        for (let i = 0; i < locationMarkers[category as keyof MarkerTypes]?.length; i++) {
            if (selectedCount[category as keyof object] >= placesCount[category as keyof object]) break;
            if (!locationMarkers[category as keyof MarkerTypes][i].isSelected) {
                locationMarkers[category as keyof MarkerTypes][i].isSelected = true;
                locationMarkers[category as keyof MarkerTypes][i].isDisplayed = true;
                selectedCount[category as keyof object]++;
            }
        }
    }

    const sortedCount = Object.fromEntries(
        Object.entries(placesCount).sort(([, a], [, b]) => b - a)
    );

    console.log(JSON.stringify(sortedCount));
    for (let category1 in locationMarkers) {
        if (selectedCount[category1 as keyof object] < placesCount[category1 as keyof object]) {
            for (let category2 in sortedCount) {
                for (let i = 0; i < locationMarkers[category2 as keyof MarkerTypes]?.length; i++) {
                    if (selectedCount[category1 as keyof object] >= placesCount[category1 as keyof object]) break;
                    if (!locationMarkers[category2 as keyof MarkerTypes][i].isSelected) {
                        locationMarkers[category2 as keyof MarkerTypes][i].isSelected = true;
                        locationMarkers[category2 as keyof MarkerTypes][i].isDisplayed = true;
                        selectedCount[category1 as keyof object]++;
                    }
                }
            }
        }
    }
}

const consoleString = (summary: any) => {
    return `\nDistance: ${summary.lengthInMeters / 1000} km\nTime: ${summary.travelTimeInSeconds / 60} min (only driving)\nDeparture time: ${summary.departureTime}\nArrival time: ${summary.arrivalTime}\n`
}

export { calcPlacesLimit, segmentRoute, createMarkers, createMarker, formatWaypString, formatCoords, calculatePreferences, sliceMarkers, consoleString };