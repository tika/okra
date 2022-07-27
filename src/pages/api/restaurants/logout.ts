import { createEndpoint } from "../../../app/endpoint";
import { RestaurantJWT } from "../../../app/restaurantjwt";

export default createEndpoint({
    POST: async (req, res) => {
        res.setHeader("Set-Cookie", RestaurantJWT.cookie("", new Date()));
        res.json({ message: "Logged out" });
    },
});
