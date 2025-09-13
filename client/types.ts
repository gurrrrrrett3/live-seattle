export interface Route {
    id: string;
    agencyId: string;
    shortName: string;
    longName: string;
    type: number;
    description: string;
    url: string;
    color: string;
    textColor: string;
    networkId: string;
    sortOrder: number;
    trips: Trip[];
}

interface Trip {
    id: string;
    route: string;
    serviceId: string;
    shortName: null;
    headSign: string;
    direction: number;
    blockId: string;
    shape: {
        id: string;
    };
    wheelChairAccessible: boolean;
    bikesAllowed: boolean;
}
