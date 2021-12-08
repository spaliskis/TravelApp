export default interface LocMarker {
    latitude: number;
    longitude: number;
    title: string;
    description?: string;
    image: string;
    distFromDep: number;
    address?: string;
    id: string;
};