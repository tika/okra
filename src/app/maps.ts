import { Client, PlaceInputType } from "@googlemaps/google-maps-services-js";
import { formatAddress } from "./primitive";

const client = new Client({});

type Address = {
    line1: string;
    line2: string | null;
    city: string;
    postcode: string;
};

export async function findPlace(address: Address) {
    const res = await client.findPlaceFromText({
        params: {
            key: process.env.GOOGLE_MAPS_API_KEY as string,
            input: formatAddress(address),
            inputtype: PlaceInputType.textQuery,
            fields: ["formatted_address", "name", "geometry"],
        },
    });

    if (res.data.candidates.length === 0) return null;
    const result = res.data.candidates[0];

    if (!result.formatted_address) return null;

    const splitted = result.formatted_address.split(",");

    // If the address doesnt end with England, then we've screwed up
    if (
        [
            "uk",
            "united kingdom",
            "england",
            "wales",
            "scotland",
            "gb",
            "ireland",
            "ie",
        ].includes(splitted[splitted.length - 1].toLowerCase())
    ) {
        return null;
    }

    return result;
}

export async function isValidAddress(address: Address) {
    const place = await findPlace(address);
    return place !== null;
}

type Distance = {
    time: number;
    km: number;
};

// Find time + meters from one place to another
export async function calcDistance(
    address1: Address,
    address2: Address
): Promise<Distance | null> {
    const a = await findPlace(address1);
    const b = await findPlace(address2);

    if (!a || !b) return null;
    if (!a.geometry || !b.geometry) return null;

    const res = await client.distancematrix({
        params: {
            key: process.env.GOOGLE_MAPS_API_KEY as string,
            origins: [a.geometry.location],
            destinations: [b.geometry.location],
        },
    });

    if (res.data.rows.length === 0) return null;

    const result = res.data.rows[0].elements;

    if (result.length === 0) return null;

    return {
        time: result[0].duration.value,
        km: result[0].distance.value,
    };
}
