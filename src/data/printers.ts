/** Модели Bambu Lab — справочные характеристики производителя (2026). Время печати в расчётах — замеренное, по модели не пересчитывается. */
export type PrinterModel = {
  id: string;
  name: string;
  /** Область печати, мм: Ш × Г × В */
  buildMm: [number, number, number];
  /** Максимальная скорость, мм/с */
  maxSpeed: number;
  enclosed: boolean;
  nozzles: 1 | 2;
  /** Снят с основной линейки, но ещё в работе */
  legacy?: boolean;
};

export const printerModels: PrinterModel[] = [
  { id: "a1-mini", name: "Bambu Lab A1 mini", buildMm: [180, 180, 180], maxSpeed: 500, enclosed: false, nozzles: 1 },
  { id: "a1", name: "Bambu Lab A1", buildMm: [256, 256, 256], maxSpeed: 500, enclosed: false, nozzles: 1 },
  { id: "p1p", name: "Bambu Lab P1P", buildMm: [256, 256, 256], maxSpeed: 500, enclosed: false, nozzles: 1, legacy: true },
  { id: "p1s", name: "Bambu Lab P1S", buildMm: [256, 256, 256], maxSpeed: 500, enclosed: true, nozzles: 1 },
  { id: "p2s", name: "Bambu Lab P2S", buildMm: [256, 256, 256], maxSpeed: 600, enclosed: true, nozzles: 1 },
  { id: "x1c", name: "Bambu Lab X1 Carbon", buildMm: [256, 256, 256], maxSpeed: 500, enclosed: true, nozzles: 1, legacy: true },
  { id: "x2d", name: "Bambu Lab X2D", buildMm: [256, 256, 260], maxSpeed: 500, enclosed: true, nozzles: 2 },
  { id: "h2s", name: "Bambu Lab H2S", buildMm: [340, 320, 340], maxSpeed: 1000, enclosed: true, nozzles: 1 },
  { id: "h2d", name: "Bambu Lab H2D", buildMm: [350, 320, 325], maxSpeed: 1000, enclosed: true, nozzles: 2 },
  { id: "h2c", name: "Bambu Lab H2C", buildMm: [305, 320, 325], maxSpeed: 1000, enclosed: true, nozzles: 2 },
];

export function getPrinterModel(id: string): PrinterModel | undefined {
  return printerModels.find((m) => m.id === id);
}

export function describePrinter(m: PrinterModel): string {
  return [
    `${m.buildMm.join("×")} мм`,
    `до ${m.maxSpeed} мм/с`,
    m.enclosed ? "закритий" : "відкритий",
    m.nozzles === 2 ? "2 сопла" : null,
    m.legacy ? "знятий з продажу" : null,
  ]
    .filter(Boolean)
    .join(" · ");
}
