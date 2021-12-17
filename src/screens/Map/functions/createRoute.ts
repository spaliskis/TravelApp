import { calcPlacesLimit, segmentRoute, createMarkers, formatWaypString, formatCoords, calculatePreferences, sliceMarkers, consoleString } from './routeFunctions';
import { createInfoBar } from './utilFunctions';
import MarkerTypes from '../../../interfaces/MarkerTypes';
import LocMarker from '../../../interfaces/LocMarker';
import * as PLdecoder from '@mapbox/polyline';
import { GOOGLE_MAPS_API_KEY, TOMTOM_API_KEY } from '@env';
import { LatLng } from 'react-native-maps';
import { fitToCoordinates } from './utilFunctions';

const createRoute = async (
    departure: string,
    arrival: string,
    preferences: object, 
    categoryUtils: object, 
    setInfoBar: React.Dispatch<React.SetStateAction<object>>,
    setMarkers: React.Dispatch<React.SetStateAction<MarkerTypes | undefined>>,
    setRouteMarkers: React.Dispatch<React.SetStateAction<LocMarker[] | undefined>>,
    setPlacesBody: React.Dispatch<React.SetStateAction<object | undefined>>,
    setDisplayedMarkers: React.Dispatch<React.SetStateAction<MarkerTypes | undefined>>,
    setCoords: React.Dispatch<React.SetStateAction<LatLng[] | undefined>>,
    setAltCoords: React.Dispatch<React.SetStateAction<LatLng[] | undefined>>,
    setAltRes: React.Dispatch<React.SetStateAction<object | undefined>>,
    setPoints: React.Dispatch<React.SetStateAction<[number, number] | undefined>>,
    mapRef: React.MutableRefObject<undefined>
    ) => {

    let locationMarkers: MarkerTypes = { touristAttraction: [], monument: [], museum: [], park: [], restaurant: [], evStation: [], gasStation: [], hotel: [], };

    // Fetching google route from departure point to arrival point
    let resp = await fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${departure}&destination=${arrival}&alternatives=true&key=${GOOGLE_MAPS_API_KEY}`);
    let respJson = await resp.json();
    // let respJson = directionsRes;
    const plLimit = calcPlacesLimit(respJson.routes[0], 40000);
    const placesCount = calculatePreferences(preferences, plLimit);
    console.log('Amount of routes returned: ' + respJson.routes.length)
    console.log(placesCount);
    let points = PLdecoder.decode(respJson.routes[0].overview_polyline.points);
    

    const altRes = respJson.routes[1];
    // Creating alternative route's coordinates
    let alternativeCoords;
    if (respJson.routes[1]) {
        let altPoints = PLdecoder.decode(respJson.routes[1].overview_polyline.points);
        alternativeCoords = altPoints.map((point: any[]) => {
            return {
                latitude: point[0],
                longitude: point[1]
            }
        });
    }

    let coordinates = points.map((point: any[]) => {
        return {
            latitude: point[0],
            longitude: point[1]
        }
    });

    // Converting coordinates to format suitable for TomTom API
    let tomtomCoords = coordinates.map((point) => {
        return {
            lat: point.latitude,
            lon: point.longitude
        }
    });

    // Removing coordinates that are 10km or closer from both departure and arrival points
    segmentRoute(tomtomCoords, points);

    // Creating body for TomTom along search API, getting places from the API
    let placesReqBody = {
        route: {
            points: tomtomCoords,
        }
    }
    // Creating request URLs for getting places of each category
    let requests = [];
    for (let category in categoryUtils) {
        if (categoryUtils[category as keyof object].isEssential) {
            requests.push(`https://api.tomtom.com/search/2/searchAlongRoute/${category}.json?maxDetourTime=1200&limit=20&&categorySet=${categoryUtils[category as keyof object].categorySet}&spreadingMode=auto&key=${TOMTOM_API_KEY}`);
        }
    }
    // Asynchronously getting data from TomTom API
    const promises = requests.map((url) =>
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(placesReqBody)
        }).then((response) => response.json())
    );
    const data = await Promise.all(promises);

    // Assigning markers from the returned places and sorting them by distance
    createMarkers(data, points, locationMarkers);

    // Selecting amount of markers that is based on distance and preferences
    let slicedMarkers = sliceMarkers(locationMarkers, placesCount);

    // Putting all selected markers into one array
    let allSelectedMarkers: LocMarker[] = [];
    for (let category in slicedMarkers) {
        if (slicedMarkers.hasOwnProperty(category)) {
            slicedMarkers[category as keyof MarkerTypes]?.forEach(marker => allSelectedMarkers.push(marker));
        }
    }
    allSelectedMarkers.sort((marker1, marker2) => marker1.distFromDep - marker2.distFromDep);
    console.log('All selected length: ' + allSelectedMarkers.length)
    setRouteMarkers(allSelectedMarkers); 

    // formating markers locations to be inserted into TomTom calculateRoute URL
    const waypUrl = formatWaypString(allSelectedMarkers, points);
    // Calculating the route with places to visit and assigning it's coordinates to the coords state
    let waypRes = await fetch(`https://api.tomtom.com/routing/1/calculateRoute/${waypUrl}/json?computeBestOrder=false&avoid=unpavedRoads&key=${TOMTOM_API_KEY}`);
    let waypResJson = await waypRes.json();
    // let waypResJson = calculateRes;
    console.log(consoleString(waypResJson.routes[0].summary));
    const waypCoords = formatCoords(waypResJson);
    setInfoBar(createInfoBar(waypResJson.routes[0].summary));
    setMarkers(locationMarkers);
    setPlacesBody(placesReqBody);
    setDisplayedMarkers(slicedMarkers);
    setCoords(waypCoords);
    setAltRes(altRes);
    setAltCoords(alternativeCoords);
    setPoints(points);
    fitToCoordinates(mapRef, waypCoords);
};




const calcAltRoute = async (
    coords: LatLng[] | undefined,
    altCoords: LatLng[],
    altRes: object,
    preferences: object, 
    categoryUtils: object, 
    setInfoBar: React.Dispatch<React.SetStateAction<object>>,
    setMarkers: React.Dispatch<React.SetStateAction<MarkerTypes | undefined>>,
    setRouteMarkers: React.Dispatch<React.SetStateAction<LocMarker[] | undefined>>,
    setPlacesBody: React.Dispatch<React.SetStateAction<object | undefined>>,
    setDisplayedMarkers: React.Dispatch<React.SetStateAction<MarkerTypes | undefined>>,
    setCoords: React.Dispatch<React.SetStateAction<LatLng[] | undefined>>,
    setAltCoords: React.Dispatch<React.SetStateAction<LatLng[] | undefined>>,
    setPoints: React.Dispatch<React.SetStateAction<[number, number] | undefined>>,
    mapRef: React.MutableRefObject<undefined>
    ) => {

    let locationMarkers: MarkerTypes = { touristAttraction: [], monument: [], museum: [], park: [], restaurant: [], evStation: [], gasStation: [], hotel: [], };

    const plLimit = calcPlacesLimit(altRes, 40000);
    const placesCount = calculatePreferences(preferences, plLimit);
    console.log(placesCount);
    let points = PLdecoder.decode(altRes.overview_polyline.points);

    // Converting coordinates to format suitable for TomTom API
    let tomtomCoords = altCoords.map((point) => {
        return {
            lat: point.latitude,
            lon: point.longitude
        }
    });

    // Removing coordinates that are 10km or closer from both departure and arrival points
    segmentRoute(tomtomCoords, points);

    // Creating body for TomTom along search API, getting places from the API
    let placesReqBody = {
        route: {
            points: tomtomCoords,
        }
    }
    // Creating request URLs for getting places of each category
    let requests = [];
    for (let category in categoryUtils) {
        if (categoryUtils[category as keyof object].isEssential) {
            requests.push(`https://api.tomtom.com/search/2/searchAlongRoute/${category}.json?maxDetourTime=1200&limit=20&&categorySet=${categoryUtils[category as keyof object].categorySet}&spreadingMode=auto&key=${TOMTOM_API_KEY}`);
        }
    }
    // Asynchronously getting data from TomTom API
    const promises = requests.map((url) =>
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(placesReqBody)
        }).then((response) => response.json())
    );
    const data = await Promise.all(promises);

    // Assigning markers from the returned places and sorting them by distance
    createMarkers(data, points, locationMarkers);

    // Selecting amount of markers that is based on distance and preferences
    let slicedMarkers = sliceMarkers(locationMarkers, placesCount);

    // Putting all selected markers into one array
    let allSelectedMarkers: LocMarker[] = [];
    for (let category in slicedMarkers) {
        if (slicedMarkers.hasOwnProperty(category)) {
            slicedMarkers[category as keyof MarkerTypes]?.forEach(marker => allSelectedMarkers.push(marker));
        }
    }
    allSelectedMarkers.sort((marker1, marker2) => marker1.distFromDep - marker2.distFromDep);
    setRouteMarkers(allSelectedMarkers);
    console.log('All selected length: ' + allSelectedMarkers.length)

    // formating markers locations to be inserted into TomTom calculateRoute URL
    const waypUrl = formatWaypString(allSelectedMarkers, points);
    // Calculating the route with places to visit and assigning it's coordinates to the coords state
    let waypRes = await fetch(`https://api.tomtom.com/routing/1/calculateRoute/${waypUrl}/json?computeBestOrder=false&avoid=unpavedRoads&key=${TOMTOM_API_KEY}`);
    let waypResJson = await waypRes.json();
    // let waypResJson = calculateRes;
    console.log(consoleString(waypResJson.routes[0].summary));
    const waypCoords = formatCoords(waypResJson);
    setInfoBar(createInfoBar(waypResJson.routes[0].summary));
    setMarkers(locationMarkers);
    setPlacesBody(placesReqBody);
    setDisplayedMarkers(slicedMarkers);
    setCoords(waypCoords);
    setAltCoords(coords);
    setPoints(points);
    fitToCoordinates(mapRef, waypCoords);
};



const recalculateRoute = async (
    displayedMarkers: MarkerTypes | undefined,
    points: [number, number] | undefined,
    setRouteMarkers: React.Dispatch<React.SetStateAction<LocMarker[] | undefined>>,
    setInfoBar: React.Dispatch<React.SetStateAction<object>>,
    setCoords: React.Dispatch<React.SetStateAction<LatLng[] | undefined>>,
    mapRef: React.MutableRefObject<undefined>
    ) => {

    let selectedMarkers: LocMarker[] = [];
    for (let category in displayedMarkers) {
        displayedMarkers[category as keyof MarkerTypes]?.forEach(marker => {
            if (marker.isSelected) selectedMarkers.push(marker);
        });
    }
    selectedMarkers!.sort((marker1, marker2) => marker1.distFromDep - marker2.distFromDep);
    setRouteMarkers(selectedMarkers);
    const waypUrl = formatWaypString(selectedMarkers!, points);
    // Calculating the route with places to visit and assigning it's coordinates to the coords state
    let waypRes = await fetch(`https://api.tomtom.com/routing/1/calculateRoute/${waypUrl}/json?computeBestOrder=false&avoid=unpavedRoads&key=${TOMTOM_API_KEY}`);
    let waypResJson = await waypRes.json();
    console.log(consoleString(waypResJson.routes[0].summary));
    const waypCoords = formatCoords(waypResJson);
    setInfoBar(createInfoBar(waypResJson.routes[0].summary));
    setCoords(waypCoords);
    fitToCoordinates(mapRef, waypCoords);
};

export { createRoute, calcAltRoute, recalculateRoute }