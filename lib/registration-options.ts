import { daniyalDropLocations, daniyalPickupLocations } from "@/lib/daniyal-transport";

export const fallbackPickupLocations = daniyalPickupLocations;
export const fallbackDropLocations = daniyalDropLocations;

export function optionsFromLines(value: string | null | undefined, fallback: string[]) {
  const options =
    value
      ?.split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean) ?? [];

  return options.length ? Array.from(new Set(options)) : fallback;
}
