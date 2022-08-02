import { createEndpoint } from "../../app/endpoint";

export default createEndpoint({
    POST: async (req, res) => {
        const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

        const token = req.body.token;

        const charge = await stripe.charges.create({
            amount: 999,
            currency: "usd",
            description: "Example charge",
            source: token,
        });

        console.log(charge.status);

        res.send(charge);
    },
});
