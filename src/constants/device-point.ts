import type { SelectOption } from 'naive-ui';

export const DATA_TYPE_OPTIONS: SelectOption[] = [
  { label: '数值', value: 1 },
  { label: '开关', value: 2 },
  { label: '文本', value: 3 },
  { label: '枚举', value: 4 }
];

export const PRECISION_OPTIONS: SelectOption[] = [
  { label: '不保留小数', value: 1 },
  { label: '保留1位小数', value: 2 },
  { label: '保留2位小数', value: 3 },
  { label: '保留3位小数', value: 4 }
];

export const ENERGY_TYPE_OPTIONS: SelectOption[] = [
  { label: '无', value: 0 },
  { label: '电量', value: 1 },
  { label: '水量', value: 2 },
  { label: '燃气量', value: 3 },
  { label: '冷量', value: 4 },
  { label: '热量', value: 5 },
  { label: '运行时长', value: 6 }
];

export const UNIT_GROUPS: SelectOption[] = [
  {
    label: '温度 (Temperature)',
    type: 'group',
    key: 'temperature',
    children: [
      { value: '℃', label: '摄氏度' },
      { value: '℉', label: '华氏度' },
      { value: 'K', label: '开尔文' }
    ]
  },
  {
    label: '湿度 (Humidity)',
    type: 'group',
    key: 'humidity',
    children: [
      { value: '%RH', label: '相对湿度' },
      { value: 'g/kg', label: '克水/千克干空气' }
    ]
  },
  {
    label: '压力 (Pressure)',
    type: 'group',
    key: 'pressure',
    children: [
      { value: 'Pa', label: '帕斯卡' },
      { value: 'kPa', label: '千帕' },
      { value: 'bar', label: '巴' },
      { value: 'hPa', label: '百帕' },
      { value: 'mbar', label: '毫巴' },
      { value: 'psi', label: '磅力/平方英寸' },
      { value: 'inH₂O', label: '英寸水柱' },
      { value: 'mmHg', label: '毫米汞柱' }
    ]
  },
  {
    label: '电气 - 电压/电流 (Electrical)',
    type: 'group',
    key: 'electrical',
    children: [
      { value: 'V', label: '伏特' },
      { value: 'mV', label: '毫伏' },
      { value: 'kV', label: '千伏' },
      { value: 'A', label: '安培' },
      { value: 'mA', label: '毫安' }
    ]
  },
  {
    label: '电气 - 功率/能量 (Power & Energy)',
    type: 'group',
    key: 'power-energy',
    children: [
      { value: 'W', label: '瓦特' },
      { value: 'mW', label: '毫瓦' },
      { value: 'kW', label: '千瓦' },
      { value: 'MW', label: '兆瓦' },
      { value: 'kWh', label: '千瓦时' },
      { value: 'MWh', label: '兆瓦时' },
      { value: 'VA', label: '伏安' },
      { value: 'kVA', label: '千伏安' },
      { value: 'VAR', label: '无功伏安' },
      { value: 'kVAR', label: '千乏' }
    ]
  },
  {
    label: '电气 - 电阻/功率因数 (Resistance)',
    type: 'group',
    key: 'resistance',
    children: [
      { value: 'Ω', label: '欧姆' },
      { value: 'mΩ', label: '毫欧' },
      { value: 'kΩ', label: '千欧' },
      { value: 'MΩ', label: '兆欧' },
      { value: 'PF', label: '功率因数' }
    ]
  },
  {
    label: '流量 (Flow)',
    type: 'group',
    key: 'flow',
    children: [
      { value: 'm³/s', label: '立方米/秒' },
      { value: 'm³/min', label: '立方米/分钟' },
      { value: 'm³/h', label: '立方米/小时' },
      { value: 'L/s', label: '升/秒' },
      { value: 'L/min', label: '升/分钟' },
      { value: 'L/h', label: '升/小时' },
      { value: 'CFM', label: '立方英尺/分钟' }
    ]
  },
  {
    label: '体积 (Volume)',
    type: 'group',
    key: 'volume',
    children: [
      { value: 'm³', label: '立方米' },
      { value: 'L', label: '升' },
      { value: 'mL', label: '毫升' },
      { value: 'ft³', label: '立方英尺' }
    ]
  },
  {
    label: '长度 (Length)',
    type: 'group',
    key: 'length',
    children: [
      { value: 'm', label: '米' },
      { value: 'cm', label: '厘米' },
      { value: 'mm', label: '毫米' },
      { value: 'km', label: '千米' },
      { value: 'ft', label: '英尺' },
      { value: 'in', label: '英寸' }
    ]
  },
  {
    label: '速度 (Velocity)',
    type: 'group',
    key: 'velocity',
    children: [
      { value: 'm/s', label: '米/秒' },
      { value: 'km/h', label: '千米/小时' },
      { value: 'ft/min', label: '英尺/分钟' }
    ]
  },
  {
    label: '频率 (Frequency)',
    type: 'group',
    key: 'frequency',
    children: [
      { value: 'Hz', label: '赫兹' },
      { value: 'kHz', label: '千赫兹' },
      { value: 'RPM', label: '转/分钟' }
    ]
  },
  {
    label: '时间 (Time)',
    type: 'group',
    key: 'time',
    children: [
      { value: 's', label: '秒' },
      { value: 'ms', label: '毫秒' },
      { value: 'min', label: '分钟' },
      { value: 'h', label: '小时' },
      { value: 'd', label: '天' }
    ]
  },
  {
    label: '质量 (Mass)',
    type: 'group',
    key: 'mass',
    children: [
      { value: 'kg', label: '千克' },
      { value: 'g', label: '克' },
      { value: 'mg', label: '毫克' },
      { value: 't', label: '吨' }
    ]
  },
  {
    label: '光照 (Light)',
    type: 'group',
    key: 'light',
    children: [
      { value: 'lx', label: '勒克斯' },
      { value: 'lm', label: '流明' },
      { value: 'fc', label: '英尺烛光' },
      { value: 'cd', label: '坎德拉' }
    ]
  },
  {
    label: '浓度 / 空气质量 (Concentration)',
    type: 'group',
    key: 'concentration',
    children: [
      { value: 'ppm', label: '百万分比' },
      { value: 'ppb', label: '十亿分比' },
      { value: 'mg/L', label: '毫克/升' },
      { value: 'mg/m³', label: '毫克/立方米' },
      { value: 'μg/m³', label: '微克/立方米' }
    ]
  },
  {
    label: '能量 (Energy)',
    type: 'group',
    key: 'energy',
    children: [
      { value: 'J', label: '焦耳' },
      { value: 'kJ', label: '千焦' },
      { value: 'MJ', label: '兆焦' },
      { value: 'Wh', label: '瓦时' },
      { value: 'BTU', label: '英热单位' }
    ]
  },
  {
    label: '声学 / 水质 (Acoustics & Water)',
    type: 'group',
    key: 'acoustics-water',
    children: [
      { value: 'dB', label: '分贝' },
      { value: 'dBA', label: 'A加权分贝' },
      { value: 'pH', label: 'pH值' },
      { value: 'NTU', label: '浊度单位' }
    ]
  },
  {
    label: '通用 (General)',
    type: 'group',
    key: 'general',
    children: [
      { value: '%', label: '百分比' },
      { value: '°', label: '角度' },
      { value: 'rad', label: '弧度' },
      { value: '-', label: '无单位' }
    ]
  }
];

export const ACCESS_LEVEL_OPTIONS: SelectOption[] = [
  { value: 1, label: '只读' },
  { value: 2, label: '只写' },
  { value: 3, label: '读写' }
];
