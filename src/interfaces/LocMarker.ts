export default interface LocMarker {
    latitude: number;
    longitude: number;
    title: string;
    image: string;
    distFromDep: number;
    address: string;
    id: string;
    isSelected: boolean;
    fsqId?: string;
};