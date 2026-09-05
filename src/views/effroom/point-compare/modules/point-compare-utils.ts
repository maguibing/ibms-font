import { $t } from '@/locales';

export type PointTreeOption = {
  key: string;
  label: string;
  name: string;
  pointKey: string;
  nodeType: number;
  checkboxDisabled: boolean;
  children?: PointTreeOption[];
};

export type ComparisonColumn = {
  key: string;
  title: string;
  unit: string;
};

export type ComparisonRow = {
  timestamp: number;
  formattedTime: string;
  [key: string]: number | string | null;
};

export type NormalizedTrend = {
  name: string;
  unit: string;
  values: Map<number, number | null>;
};

export function formatTimeLabel(timestamp: number, statType: number) {
  const date = new Date(timestamp * 1000);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  const second = String(date.getSeconds()).padStart(2, '0');

  if (statType === 4) return String(date.getFullYear());
  if (statType === 3) return month;
  if (statType === 2) return `${month}-${day}`;
  if (statType === 1) return `${hour}:00`;
  if (statType === 5) return `${hour}:${minute}:${second}`;

  return `${month}/${day}`;
}

export function calculateDrillTimeRange(clickedTimestamp: number, statType: number) {
  const date = new Date(clickedTimestamp * 1000);
  let start: Date;
  let end: Date;

  if (statType === 4) {
    start = new Date(date.getFullYear(), 0, 1, 0, 0, 0);
    end = new Date(date.getFullYear(), 11, 31, 23, 59, 59);
  } else if (statType === 3) {
    start = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0);
    end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
  } else if (statType === 2) {
    start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
    end = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
  } else if (statType === 1) {
    start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), 0, 0);
    end = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), 59, 59);
  } else {
    return null;
  }

  return {
    startAt: Math.floor(start.getTime() / 1000),
    endAt: Math.floor(end.getTime() / 1000)
  };
}

export function transformPointTree(nodes: Api.Device.LogicPointTreeNode[], parentKey = ''): PointTreeOption[] {
  return nodes.map(node => {
    const key = parentKey ? `${parentKey}/${node.type}-${node.id}` : `${node.type}-${node.id}`;
    const children = node.children?.map(child => transformPointTree([child], key)[0]);

    return {
      key,
      label: node.name,
      name: node.name,
      pointKey: node.key,
      nodeType: node.type,
      checkboxDisabled: node.type !== 3,
      ...(children?.length ? { children } : {})
    };
  });
}

export function normalizeTrendList(trendList: Api.Device.DevicePointHistoryTrend[]) {
  return trendList.map<NormalizedTrend>((item, index) => {
    const values = new Map<number, number | null>();
    let unit = '';

    for (const point of item.point_trends ?? []) {
      if (point.ts === undefined) continue;

      const rawValue = point.num_val?.value;
      values.set(point.ts, rawValue === undefined || rawValue === null || rawValue === '' ? null : Number(rawValue));
      unit ||= point.num_val?.unit ?? '';
    }

    return {
      name: item.logic_point?.name?.trim() || `${$t('effroom.value')} ${index + 1}`,
      unit,
      values
    };
  });
}

export function buildComparisonTable(trendList: Api.Device.DevicePointHistoryTrend[]) {
  const normalized = normalizeTrendList(trendList);
  const timestamps = Array.from(new Set(normalized.flatMap(item => Array.from(item.values.keys())))).sort(
    (a, b) => b - a
  );
  const columns = normalized.map<ComparisonColumn>((item, index) => ({
    key: `point_${index}`,
    title: item.name,
    unit: item.unit
  }));
  const rows = timestamps.map<ComparisonRow>(timestamp => {
    const date = new Date(timestamp * 1000);
    const row: ComparisonRow = {
      timestamp,
      formattedTime: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`
    };

    normalized.forEach((item, index) => {
      row[`point_${index}`] = item.values.get(timestamp) ?? null;
    });

    return row;
  });

  return { columns, rows };
}
