import { createEndpoint } from "../../app/endpoint";
import { calcDistance, findPlace, isValidAddress } from "../../app/maps";

export default createEndpoint({
    GET: async (req, res) => {
        console.log("Request passed");

        const a = {
            line1: "Microsoft Store",
            line2: "Oxford Street",
            city: "London",
            postcode: "W1C 1LF",
        };

        const b = {
            line1: "Apple Store",
            line2: "Oxford Street",
            city: "London",
            postcode: "W1C 1LF",
        };

        const test1 = await findPlace(a);

        const test2 = await isValidAddress(a);

        const test3 = await calcDistance(a, b);

        res.json({ test1, test2, test3 });
    },
});
