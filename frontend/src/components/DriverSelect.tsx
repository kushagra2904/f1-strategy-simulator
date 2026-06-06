import type { Driver } from "../types/api";
import { Select } from "./Select";

/** Driver dropdown with options grouped by team (backend orders by team). */
export function DriverSelect({
  drivers,
  value,
  onChange,
  disabled,
  label = "Driver",
}: {
  drivers: Driver[];
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
  label?: string;
}) {
  const byTeam = drivers.reduce<Record<string, Driver[]>>((acc, d) => {
    (acc[d.team] ??= []).push(d);
    return acc;
  }, {});

  return (
    <Select label={label} value={value} onChange={onChange} disabled={disabled}>
      {Object.entries(byTeam).map(([team, list]) => (
        <optgroup key={team} label={team}>
          {list.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </optgroup>
      ))}
    </Select>
  );
}
