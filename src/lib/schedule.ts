const DAY = 24 * 60;

export type PrintJob = { label: string; minutes: number };

export type ShiftSettings = {
  /** Длительность смены, часов */
  shiftHours: number;
  /** Смен в сутки */
  shiftsPerDay: number;
  /** Печать, запущенная в смену, может закончиться после неё (на ночь) */
  overnight: boolean;
};

export type PrinterLoad = { printer: string; jobs: PrintJob[]; busyMinutes: number; finish: number };

export type Schedule = {
  /** Минут от начала первой смены до окончания последней печати */
  finish: number;
  /** Сколько смен (рабочих дней при 1 смене) задействовано */
  shiftsUsed: number;
  printers: PrinterLoad[];
};

/**
 * Раскладывает печати по принтерам (самые длинные — первыми, каждая на принтер, где начнётся раньше).
 * Запускать печать можно только во время смены: окно [0, shiftHours × shiftsPerDay) каждых суток.
 */
export function schedulePrints(jobs: PrintJob[], printers: string[], settings: ShiftSettings): Schedule {
  const windowMin = Math.min(DAY, settings.shiftHours * 60 * settings.shiftsPerDay);
  const continuous = windowMin >= DAY;
  const shiftMin = settings.shiftHours * 60;

  /** Ближайший момент ≥ t, когда оператор на смене */
  const nextStart = (t: number) => {
    if (continuous) return t;
    const day = Math.floor(t / DAY);
    return t - day * DAY < windowMin ? t : (day + 1) * DAY;
  };

  const loads: PrinterLoad[] = printers.map((printer) => ({ printer, jobs: [], busyMinutes: 0, finish: 0 }));
  if (loads.length === 0) return { finish: 0, shiftsUsed: 0, printers: [] };

  for (const job of [...jobs].sort((a, b) => b.minutes - a.minutes)) {
    let best: { load: PrinterLoad; start: number } | null = null;
    for (const load of loads) {
      let start = nextStart(load.finish);
      if (!continuous && !settings.overnight && job.minutes <= windowMin) {
        const windowEnd = Math.floor(start / DAY) * DAY + windowMin;
        if (start + job.minutes > windowEnd) start = (Math.floor(start / DAY) + 1) * DAY;
      }
      if (!best || start < best.start) best = { load, start };
    }
    best!.load.jobs.push(job);
    best!.load.busyMinutes += job.minutes;
    best!.load.finish = best!.start + job.minutes;
  }

  const finish = Math.max(...loads.map((l) => l.finish));
  // Последняя смена — та, в которой стартовала последняя печать
  const lastStart = Math.max(...loads.map((l) => l.finish - (l.jobs.at(-1)?.minutes ?? 0)));
  const day = Math.floor(lastStart / DAY);
  const shiftsUsed = continuous
    ? Math.ceil(finish / shiftMin)
    : day * settings.shiftsPerDay + Math.floor((lastStart - day * DAY) / shiftMin) + 1;

  return { finish, shiftsUsed: jobs.length ? shiftsUsed : 0, printers: loads };
}
