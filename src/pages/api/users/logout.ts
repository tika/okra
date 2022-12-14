import { createEndpoint } from "../../../app/endpoint";
import { UserJWT } from "../../../app/userjwt";

export default createEndpoint({
    POST: async (req, res) => {
        res.setHeader("Set-Cookie", UserJWT.cookie("", new Date()));
        res.json({ message: "Logged out" });
    },
});
