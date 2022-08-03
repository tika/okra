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

export function convertDate(date: Date) {
    return `${date.getDay()}/${date.getMonth()}/${date.getFullYear()}`;
}
