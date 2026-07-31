export const OVERVIEW_POINT_KEYS = ['SYS_TOTAL_ENRG', 'SYS_TOTAL_COOL'] as const;

type NumericPoint = {
  ts?: number;
  logic_point?: {
    key?: string;
  };
  num_val?: {
    value?: number | string;
    scale?: number;
  };
};

type PointTrend = {
  logic_point?: {
    key?: string;
  };
  point_trends?: NumericPoint[];
};

export type OverviewSummaryItem = {
  key: string;
  label: string;
  value: string;
  unit: string;
  color: string;
  icon: string;
};

export type OverviewChartData = {
  xAxisData: string[];
  seriesData: Array<number | null>;
  copData?: Array<number | null>;
};

const SUMMARY_CONFIG = [
  {
    key: 'SYS_TOTAL_ENRG',
    label: '总能耗',
    unit: 'kWh',
    color: '#2080f0',
    icon: 'material-symbols:electric-bolt-outline-rounded'
  },
  {
    key: 'SYS_TOTAL_COOL',
    label: '总冷量',
    unit: 'kWh',
    color: '#18a058',
    icon: 'material-symbols:ac-unit-rounded'
  }
] as const;

function getNumericValue(point?: NumericPoint) {
  const value = point?.num_val?.value;

  if (value === undefined || value === null || value === '') return null;

  const numericValue = Number(value);

  return Number.isFinite(numericValue) ? numericValue : null;
}

function formatPointValue(point: NumericPoint | undefined, locale: string) {
  const value = getNumericValue(point);

  if (value === null) return '--';

  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: point?.num_val?.scale ?? 0
  }).format(value);
}

export function buildOverviewStats(pointValues: NumericPoint[], locale = 'zh-CN'): OverviewSummaryItem[] {
  const findPoint = (key: string) => pointValues.find(point => point.logic_point?.key === key);
  const energyPoint = findPoint('SYS_TOTAL_ENRG');
  const coolingPoint = findPoint('SYS_TOTAL_COOL');
  const energyValue = getNumericValue(energyPoint);
  const coolingValue = getNumericValue(coolingPoint);

  return [
    ...SUMMARY_CONFIG.map(item => ({
      ...item,
      value: formatPointValue(findPoint(item.key), locale)
    })),
    {
      key: 'TOTAL_CO2',
      label: '碳排放量',
      value:
        energyValue === null
          ? '--'
          : new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(Math.round(energyValue * 0.5568)),
      unit: 't',
      color: '#8a2be2',
      icon: 'material-symbols:co2-rounded'
    },
    {
      key: 'AVERAGE_COP',
      label: '平均 COP',
      value:
        energyValue === null || energyValue === 0 || coolingValue === null
          ? '--'
          : new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
              coolingValue / energyValue
            ),
      unit: '',
      color: '#f0a020',
      icon: 'material-symbols:speed-outline-rounded'
    }
  ];
}

export function buildTrendChartData(trendList: PointTrend[], formatTime: (timestamp: number) => string) {
  const getTrends = (key: string) => {
    const trends = trendList.find(item => item.logic_point?.key === key)?.point_trends;

    return Array.isArray(trends) ? [...trends].sort((first, second) => Number(first.ts) - Number(second.ts)) : [];
  };
  const energyTrends = getTrends('SYS_TOTAL_ENRG');
  const coolingTrends = getTrends('SYS_TOTAL_COOL');
  const energyByTimestamp = new Map(energyTrends.map(item => [Number(item.ts), getNumericValue(item)]));

  return {
    electricity: {
      xAxisData: energyTrends.map(item => formatTime(Number(item.ts))),
      seriesData: energyTrends.map(getNumericValue)
    } satisfies OverviewChartData,
    cooling: {
      xAxisData: coolingTrends.map(item => formatTime(Number(item.ts))),
      seriesData: coolingTrends.map(getNumericValue),
      copData: coolingTrends.map(item => {
        const coolingValue = getNumericValue(item);
        const energyValue = energyByTimestamp.get(Number(item.ts));

        if (coolingValue === null || energyValue === null || energyValue === undefined || energyValue === 0)
          return null;

        return Number((coolingValue / energyValue).toFixed(2));
      })
    } satisfies OverviewChartData
  };
}
