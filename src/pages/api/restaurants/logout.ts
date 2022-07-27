import { createEndpoint } from "../../../app/endpoint";
import { JWT } from "../../../app/userjwt";

export default createEndpoint({
    POST: async (req, res) => {
        res.setHeader("Set-Cookie", JWT.cookie("", new Date()));
        res.json({ message: "Logged out" });
    },
});
