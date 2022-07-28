export const isNumber = (val: string | number) =>
    !!(val || val === 0) && !isNaN(Number(val.toString()));
