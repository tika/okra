# Designing Okra

## Designing the UI

### User view

![User view](https://i.imgur.com/SR3sGDp.png)

### Restaurant view

![Restaurant view](https://i.imgur.com/P3DiSSH.png)

I initially started by designing the UI using Figma ([view design file](https://www.figma.com/file/rr9eYHjPt5Bml98plf8g78/cs50-final?node-id=0%3A1)), and I split this task into two different sections - the restaurant view and the user view. After making the authentication pages (login, signup etc), I looked to UberEats for some inspiration, so thats where the similarities in the menu pages come from.

After designing all the UI, I decided it would be best to write all the CSS myself, since I find it both easier than using a library (like Bootstrap) as well as it would be hard to replicate this exact design. This would also mean that its harder to make it fully responsive, so the final UI, you may notice, is not entirely mobile-friendly, however, it is (somewhat) usable.

## Designing the Database

Next up, I wanted to design the database structure. As I knew I wanted to use Prisma, an ORM I'm familiar with, I simply wrote out a very loose SQL syntax (almost pseudocode). This helped me get an idea of where the main design problems lied ([view the schema](./prisma/schema.prisma)). I wanted to include different variations/options for each item: for example, when ordering a pizza you can choose your toppings (like extra pepperoni), or perhaps choosing different saucing to go with your hot wings. However, I realised this would be hard to include, so I decided to omit it from my final design. You may also notice, looking back on the commits on [this repo](https://github.com/tika/okra) that I switched from using SQLite to PostgreSQL. This is simply because SQLite cannot be hosted on Vercel as it uses Serverless functions, meaning the data wouldn't be persisted. Thankfully, Prisma managed to migrate this easily

## Programming

I began by creating the authentication section of the app, using boilerplate code from previous NextJS projects. I chose to use NextJS as it allowed me to have both backend and frontend code in a mono-repo, which is just ideal for projects like this. I spent a lot of my time on the CSS too, as after creating a form, I would need to style it completely. After creating many of the main pages, I realised I had made a mistake which is hard to fix (I didn't in the end, but I will for future projects) - when using getServerSideProps (i.e. running some code on the server before the page loads, and passing that data into the page) I forgot to sanitise the content, so you may be able to view user's hashed passwords etc if using the React extension on Chrome. This was the main "oh no" moment in the project. I also decided to take a shortcut in the project - instead of taking an image upload from the user and storing this in a storage bucket like S3, I chose to use cloudinary and to generate a URL "on the spot" (you can view this [here](./src/app/convertimage.ts)), which means I don't have to deal with an extra annoyance. Also, I chose to use localstorage to store the user's cart details. I also had some trouble thinking about how they would check out, and I decided in the end that each restaurant would have their own cart, meaning that you only have to checkout to one stripe payment gateway After implementing all of the CRUD logic, I added Stripe, which allows restaurants to setup their own payment gateways to handle transactions. Afterwards, I added sending emails, and finally, some Google Maps logic.
