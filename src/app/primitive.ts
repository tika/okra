export const isNumber = (val: string | number) =>
    !!(val || val === 0) && !isNaN(Number(val.toString()));

export function capitalise(val: string) {
    return val
        .toLowerCase()
        .split(" ")
        .map((it) => it.charAt(0).toUpperCase() + it.substring(1))
        .join(" ");
}

export function formatPrice(price: number) {
    const formatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "GBP",
    });

    return formatter.format(price);
}

function padZero(a: number): string {
    return a.toString().length < 2 ? `0${a}` : a.toString();
}

export function convertDate(date: Date) {
    return `${padZero(date.getDay())}/${padZero(date.getMonth())}/${padZero(
        date.getFullYear()
    )}`;
}

export function convertTime(date: Date) {
    return `${padZero(date.getHours())}:${padZero(date.getMinutes())}`;
}

export function formatAddress(address: {
    line1: string;
    line2: string | null;
    city: string;
    postcode: string;
}) {
    return `${address.line1}, ${address.line2 && address.line2 + ", "}${
        address.city
    }, ${address.postcode}`;
}
