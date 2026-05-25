export const fallbackPickupLocations = ["School Campus"];
export const fallbackDropLocations = ["Home Stop"];

export function optionsFromLines(value: string | null | undefined, fallback: string[]) {
  const options =
    value
      ?.split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean) ?? [];

  return options.length ? Array.from(new Set(options)) : fallback;
}
