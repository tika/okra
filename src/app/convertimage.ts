// converts an image url given to us to a cloudinary url
export function convertImage(ordinaryURL: string) {
    if (ordinaryURL.startsWith("https://res.cloudinary.com/"))
        return ordinaryURL;

    return `https://res.cloudinary.com/demo/image/fetch/${ordinaryURL}`;
}
