# OKRA

## Food delivered to you

Okra, much like UberEats, is an alternative to order food from a restaurant. Typically, people must call the restaurant and order a takeaway, but now, they can simply go on Okra, create an account and browse through the available restaurants and place an order.

## Preview

[Short video presentation found here](https://www.youtube.com/watch?v=kAGkPxa9AS8)

I recommend checking out this website [here](https://okra.tika.is/). It is hosted by [Vercel](https://vercel.com/), with an [additional service](https://railway.app/) to host the PostgreSQL database. Unfortunately, this does mean that access speeds to the database can be slow as it is located in an external location, however, it will still work as intended (after a while)

**Note: after deploying the app, some unexpected errors have occured. If a JSON error occurs, simply reclick the button and it should work**

## Running locally

If you wish to locally run this project, simply clone this repository and create a `.env` file. **It is necessary to fill out this file with all the values found in `.env.example`, of course, with your own API keys etc.**

After this, simply run `yarn` or `npm install`, and then run `yarn dev` or `npm run dev`. This will then run the program in test (dev) mode. If necessary, you can run `yarn build` or `npm run build`, or any other commands found in `package.json`

## Routes

This webapp uses many different routes in order to deliver its content. You can find these in `/src/pages`, and you can find the API routes in `/src/pages/api`

Here are two tables displaying those routes, and their functions:

| Page                                  | Function                                                                           |
| ------------------------------------- | ---------------------------------------------------------------------------------- |
| /                                     | Landing page, with authentication buttons (restaurant login at the bottom)         |
| /users/login                          | Login page for users                                                               |
| /users/logout                         | Logs user out                                                                      |
| /users/signup                         | Sign up for users                                                                  |
| /users/app                            | Restaurant search/browse page                                                      |
| /users/app/edit                       | Edit profile page (change user details)                                            |
| /users/app/view/{USER_ID}             | View user's page (shows all the feedback they have given)                          |
| /users/app/{RESTAURANT_ID}            | Browse restaurant menu & ability to add items to cart                              |
| /users/app/{RESTAURANT_ID}/cart       | View cart at this restaurant, and proceed to checkout                              |
| /users/app/{RESTAURANT_ID}/checkout   | Input cart details, pay for items in cart                                          |
| /users/app/{RESTAURANT_ID}/{ORDER_ID} | Page after placing an order - ability to leave feedback                            |
| /users/app/{RESTAURANT_ID}/reviews    | View all reviews of restaurant left by customers                                   |
| /restaurants/login                    | Login page for restaurants                                                         |
| /restaurants/logout                   | Logs restaurant out                                                                |
| /restaurants/signup                   | Sign up for restaurants                                                            |
| /restaurants/app                      | Dashboard display, quick summary of orders and recent reviews                      |
| /restaurants/edit                     | Edit restaurant profile page (change restaurant details)                           |
| /restaurants/menu                     | Edit menu, add items and remove them                                               |
| /restaurants/orders                   | View all orders sorted by when they were created & ability to complete/cancel them |

<hr />

| API Route                    | GET function                                             | POST function                                              | PATCH function                 | DELETE function                |
| ---------------------------- | -------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------ | ------------------------------ |
| /users                       | ...                                                      | Creates a new user                                         | Updates a user's profile       | Deletes a user                 |
| /users/{USER_ID}             | Displays details of a user with id {USER_ID}             | ...                                                        | ...                            | ...                            |
| /users/login                 | ...                                                      | Logs a user in                                             | ...                            | ...                            |
| /users/logout                | ...                                                      | Logs out a user                                            | ...                            | ...                            |
| /restaurants                 | ...                                                      | Creates a new restaurant                                   | Updates a restaurant's details | Deletes a restaurant           |
| /restaurants/{RESTAURANT_ID} | Displays details of a restaurant with id {RESTAURANT_ID} | ...                                                        | ..                             | ...                            |
| /restaurants/login           | ...                                                      | Logs a restaurant in                                       | ...                            | ...                            |
| /restaurants/logout          | ...                                                      | Logs out a restaurant                                      | ...                            | ...                            |
| /restaurants/menu            | Displays restaurant's menu                               | Sets menu equal to input                                   | ...                            | Deletes menu contents          |
| /restaurants/reviews         | Gets a review                                            | Creates a new review                                       | ...                            | ...                            |
| /restaurants/checkout        | ...                                                      | Places a new order, takes amount and sends emails          | ...                            | ...                            |
| /restaurants/orders          | ...                                                      | Completes an order (i.e. the order has now been delivered) | ...                            | "Cancels order", or deletes it |

## Technologies used:

-   google-maps-services-js
-   headless-ui
-   heroicons
-   prisma + @prisma/client
-   react-stripe-js + stripe-js
-   cookie
-   argon2
-   babel-plugin-superjson-next
-   boring-avatars
-   dayjs
-   emailjs
-   jsonwebtoken
-   next
-   react, react-dom
-   react-hot-toast
-   stripe
-   superjson
-   ts-localstorage
-   zod

Thanks,<br>
This was _CS50_.
