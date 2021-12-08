import { GOOGLE_MAPS_API_KEY, EARTH_RADIUS, TOMTOM_API_KEY } from '@env';
import { LatLng } from 'react-native-maps';
import LocMarker from '../interfaces/LocMarker';

const calcPlacesLimit = (response: any, divider: number) => {
    let dirAPIdistance = 0;
    response.routes[0].legs.forEach((leg: object) => {
        dirAPIdistance += leg.distance.value;
    });
    const placesLimit = Math.ceil(dirAPIdistance / divider);
    return placesLimit;
}

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

const findRouteRestaurants = async (points: any, markers: Array<LocMarker>) => {
    
    let j = 0;
    let stop = 0;

    let restaurantCoords = [];
    for (let i = 0; i < points.length; i += 10) {
        if (distance(points[j][0], points[j][1], points[i][0], points[i][1]) > 100) {
            restaurantCoords.push([points[i][0], points[i][1]]);
            j = i;
        }
    }
    if (restaurantCoords.length > 10) throw new Error('too many');
    for (let i = 0; i < restaurantCoords.length; i++) {
        if (!restaurantCoords[i + 1]) break;
        let res;
        try {
            res = await fetch(`https://api.tomtom.com/search/2/searchAlongRoute/restaurant.json?maxDetourTime=1200&limit=1&spreadingMode=auto&key=${TOMTOM_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    route: {
                        points: [
                            {
                                lat: restaurantCoords[i][0],
                                lon: restaurantCoords[i][1]
                            },
                            {
                                lat: restaurantCoords[i + 1] ? restaurantCoords[i + 1][0] : points[points.length - 1][0],
                                lon: restaurantCoords[i + 1] ? restaurantCoords[i + 1][1] : points[points.length - 1][1],
                            },
                        ],
                    }
                })
            });
        } catch (error) {
            console.log(error);
            break;
        }
        const resJson = await res.json();
        const distFromDep = distance(points[0][0], points[0][1], resJson.results[0].position.lat, resJson.results[0].position.lon);
        const marker: LocMarker = {
            id: resJson.results[i].id,
            latitude: resJson.results[0].position.lat,
            longitude: resJson.results[0].position.lon,
            title: resJson.results[0].poi.name,
            image: 'restaurant',
            distFromDep
        }
        markers.push(marker);

        console.log(marker);
    }
}

const sortPlacesByDist = (alongRouteRes: any, points: any, markers: Array<LocMarker>) => {
    let detailedPlaces = alongRouteRes.results.filter((result) => result.dataSources);
    alongRouteRes.results.forEach(element => {
        console.log(element.dataSources);
    });
    for (let i = 0; i < detailedPlaces.length; i++) {
        const distFromDep = distance(points[0][0], points[0][1], detailedPlaces[i].position.lat, detailedPlaces[i].position.lon);
        const marker: LocMarker = {
            id: detailedPlaces[i].id,
            latitude: detailedPlaces[i].position.lat,
            longitude: detailedPlaces[i].position.lon,
            title: detailedPlaces[i].poi.name,
            address: detailedPlaces[i].address.freeformAddress,
            image: 'attraction',
            distFromDep
        }
        markers.push(marker);
    }
    markers = markers.sort((marker1, marker2) => marker1.distFromDep - marker2.distFromDep);
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

export { calcPlacesLimit, segmentRoute, findRouteRestaurants, sortPlacesByDist, formatWaypString, formatCoords };