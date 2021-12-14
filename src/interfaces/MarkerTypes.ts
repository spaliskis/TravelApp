import LocMarker from "./LocMarker";

export default interface MarkerTypes {
    touristAttraction: Array<LocMarker>;
    monument: Array<LocMarker>;
    museum: Array<LocMarker>;
    park: Array<LocMarker>;
    restaurant?: Array<LocMarker>;
    gasStation?: Array<LocMarker>;
    evStation?: Array<LocMarker>;
    hotel?: Array<LocMarker>;
};