import { hm, type Part } from "@/lib/calc";

/** КОЖАН 4.0 — 3D-печать. Партия: сколько деталей за одну печать, время, пластик. */
export const kozhan4Parts: Part[] = [
  { no: 1, name: "Основа передня панель", batch: { quantity: 2, minutes: hm(0, 408), grams: 127 }, perAssembly: 1 },
  { no: 2, name: "Кріплення плати заряду", unit: "пар", batch: { quantity: 125, minutes: hm(11, 46), grams: 224 }, perAssembly: 1 },
  { no: 3, name: "Кнопка ввімкнення", batch: { quantity: 544, minutes: hm(12, 35), grams: 172.63 }, perAssembly: 1 },
  { no: 4, name: "Планка проміжна", batch: { quantity: 6, minutes: hm(0, 27), grams: 5.04 }, perAssembly: 1 },
  { no: 5, name: "Фіксатор АКБ", batch: { quantity: 24, minutes: hm(6, 26), grams: 156.56 }, perAssembly: 1 },
  { no: 7, name: "Основа задня панель", batch: { quantity: 2, minutes: hm(6, 52), grams: 158 }, perAssembly: 1 },
  { no: 8, name: "Кнопки перемикання (м'яка планка)", batch: { quantity: 38, minutes: hm(7, 32), grams: 81.85 }, perAssembly: 1 },
  { no: 10, name: "М'яка заглушка MT-30", batch: { quantity: 100, minutes: hm(3, 32), grams: 43.33 }, perAssembly: 1 },
  { no: 11, name: "Заглушка AV", batch: { quantity: 240, minutes: hm(21, 7), grams: 334.22 }, perAssembly: 1 },
  { no: 12, name: "Холдер", batch: { quantity: 3, minutes: hm(10, 46), grams: 273.21 }, perAssembly: 1 },
  { no: 13, name: "М'яка заглушка AV", batch: { quantity: 100, minutes: hm(5), grams: 57.12 }, perAssembly: 1 },
  { no: 15, name: "М'яка заглушка Type-C", batch: { quantity: 100, minutes: hm(2, 51), grams: 33 }, perAssembly: 1 },
];
