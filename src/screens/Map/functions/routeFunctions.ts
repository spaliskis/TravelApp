import { GOOGLE_MAPS_API_KEY, EARTH_RADIUS, TOMTOM_API_KEY } from '@env';
import { LatLng } from 'react-native-maps';
import LocMarker from '../../../interfaces/LocMarker';
import MarkerTypes from '../../../interfaces/MarkerTypes';

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

// const findRouteRestaurants = async (points: any, markers: Array<LocMarker>) => {

//     let j = 0;
//     let stop = 0;

//     let restaurantCoords = [];
//     for (let i = 0; i < points.length; i += 10) {
//         if (distance(points[j][0], points[j][1], points[i][0], points[i][1]) > 100) {
//             restaurantCoords.push([points[i][0], points[i][1]]);
//             j = i;
//         }
//     }
//     if (restaurantCoords.length > 10) throw new Error('too many');
//     for (let i = 0; i < restaurantCoords.length; i++) {
//         if (!restaurantCoords[i + 1]) break;
//         let res;
//         try {
//             res = await fetch(`https://api.tomtom.com/search/2/searchAlongRoute/restaurant.json?maxDetourTime=1200&limit=1&spreadingMode=auto&key=${TOMTOM_API_KEY}`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify({
//                     route: {
//                         points: [
//                             {
//                                 lat: restaurantCoords[i][0],
//                                 lon: restaurantCoords[i][1]
//                             },
//                             {
//                                 lat: restaurantCoords[i + 1] ? restaurantCoords[i + 1][0] : points[points.length - 1][0],
//                                 lon: restaurantCoords[i + 1] ? restaurantCoords[i + 1][1] : points[points.length - 1][1],
//                             },
//                         ],
//                     }
//                 })
//             });
//         } catch (error) {
//             console.log(error);
//             break;
//         }
//         const resJson = await res.json();
//         const distFromDep = distance(points[0][0], points[0][1], resJson.results[0].position.lat, resJson.results[0].position.lon);
//         const marker: LocMarker = {
//             id: resJson.results[i].id,
//             latitude: resJson.results[0].position.lat,
//             longitude: resJson.results[0].position.lon,
//             title: resJson.results[0].poi.name,
//             image: 'restaurant',
//             distFromDep
//         }
//         markers.push(marker);

//         console.log(marker);
//     }
// }

const createMarker = (response: any, category: string, points: any, markers: Array<LocMarker>) => {
    for (let i = 0; i < response.results.length; i++) {
        const distFromDep = distance(points[0][0], points[0][1], response.results[i].position.lat, response.results[i].position.lon);
        const marker: LocMarker = {
            id: response.results[i].id,
            latitude: response.results[i].position.lat,
            longitude: response.results[i].position.lon,
            title: response.results[i].poi.name,
            address: response.results[i].address.freeformAddress,
            image: category,
            distFromDep,
            isSelected: false
        }
        markers.push(marker);
    }
}

const createMarkers = (data: any, points: any, markers: MarkerTypes) => {
    data.forEach((response: any) => {
        console.log(response.summary.query)
        switch (response.summary.query) {
            case 'museum':
                createMarker(response, 'museum', points, markers.museum);
                break;

            case 'monument':
                createMarker(response, 'monument', points, markers.monument);
                break;

            case 'touristattraction':
                createMarker(response, 'touristAttraction', points, markers.touristAttraction);
                break;

            case 'park':
                createMarker(response, 'park', points, markers.park);
                break;
        }
    });
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

const calculatePreferences = (preferences: object, placesLimit: number) => {
    const totalMarks = preferences.museum + preferences.park + preferences.monument + preferences.touristAttraction;
    const multiplier = placesLimit / totalMarks;
    const placesCount = {
        museumCount: Math.round(preferences.museum * multiplier),
        parkCount: Math.round(preferences.park * multiplier),
        monumentCount: Math.round(preferences.monument * multiplier),
        touristAttractionCount: Math.round(preferences.touristAttraction * multiplier),
    }
    return placesCount;
};

const sliceMarkers = (locationMarkers: MarkerTypes, placesCount: any) => {
    let slicedMarkers: MarkerTypes = {
        restaurant: locationMarkers?.restaurant?.slice(0, placesCount.restaurantCount),
        monument: locationMarkers.monument.slice(0, placesCount.monumentCount),
        park: locationMarkers.park.slice(0, placesCount.parkCount),
        museum: locationMarkers.museum.slice(0, placesCount.museumCount),
        touristAttraction: locationMarkers.touristAttraction.slice(0, placesCount.touristAttractionCount),
    }
    for (let category in slicedMarkers) {
        if (slicedMarkers.hasOwnProperty(category)) {
            slicedMarkers[category as keyof MarkerTypes]?.forEach(marker => marker.isSelected = true);
        }
    }
    return slicedMarkers;
}

const consoleString = (summary: any) => {
   return `\nDistance: ${summary.lengthInMeters / 1000} km\nTime: ${summary.travelTimeInSeconds / 60} min (only driving)\nDeparture time: ${summary.departureTime}\nArrival time: ${summary.arrivalTime}\n`
}

export { calcPlacesLimit, segmentRoute, createMarkers, createMarker, formatWaypString, formatCoords, calculatePreferences, sliceMarkers, consoleString };