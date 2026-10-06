const num = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 4 });
const money = new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const fmt = (n: number) => num.format(n);
export const fmtMoney = (n: number) => money.format(n);
