export type FilterConfigValue = string | number | boolean | null | undefined;

export type ValidFilterConfigValue = Exclude<FilterConfigValue, null | undefined>;

export interface FilterConfig {
  type: number;
  value: FilterConfigValue;
}

export interface ValidFilterConfig {
  type: number;
  value: ValidFilterConfigValue;
}

export function isValidFilterConfig(item: FilterConfig): item is ValidFilterConfig {
  return item.value !== null && item.value !== undefined;
}
