const createInfoBar = (summary: object): object => {
    return {
        isShown: true,
        distance: Math.round(summary.lengthInMeters / 1000 * 10) / 10,
        time: `${Math.floor(summary.travelTimeInSeconds / 3600)} h ${Math.floor(summary.travelTimeInSeconds / 60 % 60)} min ${Math.floor(summary.travelTimeInSeconds % 60)} s`,
        depTime: String(`${new Date(summary.departureTime).getHours()}:${new Date(summary.departureTime).getMinutes()}`),
        arrTime: String(`${new Date(summary.arrivalTime).getHours()}:${new Date(summary.arrivalTime).getMinutes()}`),
    }
}

export { createInfoBar }