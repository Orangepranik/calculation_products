import type { ReactNode } from "react";
import { pluralDevices } from "./ProductCalculator";
import type { SectionId } from "@/lib/positions";
import { calcMaterials, type MaterialCategory, type MaterialItem, type MaterialTotal } from "@/lib/bom";
import { formatCount, formatLength, formatSegments } from "@/lib/format";

const forDevicesLabel = (devices: number) => `На ${formatCount(devices)} ${pluralDevices(devices)}`;

/** Комплектующие, крепёж, расходники (одинаковые позиции сложены), нарезка на отрезки */
export function MaterialsSections({ items, devices }: { items: MaterialItem[]; devices: number }) {
  const { totals } = calcMaterials(items, devices);
  const by = (c: MaterialCategory) => totals.filter((t) => t.category === c);
  const components = by("component");
  const fasteners = by("fastener");
  const consumables = by("consumable");
  const cuts = by("cut");
  const forDevices = forDevicesLabel(devices);

  return (
    <>
      {components.length > 0 && (
        <Section id="components" title="Комплектуючі" first>
          <MaterialsTable rows={components} devices={devices} forDevices={forDevices} withTotal />
        </Section>
      )}
      {fasteners.length > 0 && (
        <Section id="fasteners" title="Кріплення">
          <MaterialsTable rows={fasteners} devices={devices} forDevices={forDevices} />
        </Section>
      )}
      {consumables.length > 0 && (
        <Section id="consumables" title="Витратні матеріали">
          <MaterialsTable rows={consumables} devices={devices} forDevices={forDevices} />
        </Section>
      )}
      {cuts.length > 0 && (
        <Section id="cuts" title="Нарізання на відрізки">
          <MaterialsTable rows={cuts} devices={devices} forDevices={forDevices} />
        </Section>
      )}
    </>
  );
}

/** Упаковка и документы — выводится в конце страницы */
export function PackagingSection({ items, devices }: { items: MaterialItem[]; devices: number }) {
  const packaging = calcMaterials(items, devices).totals.filter((t) => t.category === "packaging");
  if (packaging.length === 0) return null;
  return (
    <Section id="packaging" title="Пакування">
      <MaterialsTable rows={packaging} devices={devices} forDevices={forDevicesLabel(devices)} />
    </Section>
  );
}

function Section({ id, title, first, children }: { id: SectionId; title: string; first?: boolean; children: ReactNode }) {
  return (
    <section id={id} className={`scroll-mt-6 ${first ? "mt-12" : "mt-16"}`}>
      <h2 className="text-sm font-medium text-neutral-500">{title}</h2>
      {children}
    </section>
  );
}

function MaterialsTable({
  rows,
  devices,
  forDevices,
  withTotal,
}: {
  rows: MaterialTotal[];
  devices: number;
  forDevices: string;
  withTotal?: boolean;
}) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[480px] text-sm tabular-nums">
        <thead>
          <tr className="border-b border-neutral-200 text-left text-xs text-neutral-500">
            <th className="py-2 pr-3 font-normal">Позиція</th>
            <th className="py-2 pr-3 text-right font-normal">На виріб</th>
            <th className="py-2 text-right font-normal">{forDevices}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.code ?? r.name} className="border-b border-neutral-100">
              <td className="py-3 pr-3">
                <Name name={r.name} code={r.code} />
              </td>
              <td className="py-3 pr-3 text-right">
                <Amount total={r} multiplier={1} />
              </td>
              <td className="py-3 text-right">
                <Amount total={r} multiplier={devices} />
              </td>
            </tr>
          ))}
        </tbody>
        {withTotal && (
          <tfoot>
            <tr className="font-medium">
              <td className="py-3 pr-3">Разом</td>
              <td className="py-3 pr-3 text-right">{formatCount(rows.reduce((s, r) => s + r.count, 0))} шт</td>
              <td className="py-3 text-right">{formatCount(rows.reduce((s, r) => s + r.pieces, 0))} шт</td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}

/** Позиции с длиной: главное — метраж, отрезки мелко сбоку. Остальные — штуки. */
function Amount({ total, multiplier }: { total: MaterialTotal; multiplier: number }) {
  if (total.cm === null) return <>{formatCount(total.count * multiplier)} шт</>;
  return <Length cm={total.cm * multiplier} detail={formatSegments(total.segments, multiplier)} />;
}

export function Length({ cm, detail }: { cm: number; detail: string }) {
  return (
    <>
      <span className="mr-2 text-xs text-neutral-400">
        {detail.split(" + ").map((part, i) => (
          <span key={i} className="whitespace-nowrap">
            {i > 0 && " + "}
            {part}
          </span>
        ))}
      </span>
      <span className="whitespace-nowrap">{formatLength(cm)}</span>
    </>
  );
}

function Name({ name, code }: { name: string; code?: string }) {
  return (
    <>
      {name}
      {code && <span className="ml-2 text-xs text-neutral-400">{code}</span>}
    </>
  );
}
