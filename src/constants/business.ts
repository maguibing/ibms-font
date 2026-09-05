import { transformRecordToOption, transformRecordToNumberOption } from '@/utils/common';
import { computed } from 'vue';
import type { SelectOption } from 'naive-ui';
import { $t } from '@/locales';
import { AggType, StatType } from '@/enum/business';

/** enable status */
export const enableStatusRecord = computed<Record<Api.Common.EnableStatus, string>>(() => ({
  '1': $t('common.enabled'),
  '2': $t('common.disabled')
}));

export const enableStatusOptions = computed(() => transformRecordToNumberOption(enableStatusRecord.value));

/** ledger asset status options */
export const assetsStatusOptions = computed<CommonType.Option<number>[]>(() => [
  { label: $t('ledger.normal'), value: 1 },
  { label: $t('ledger.repair'), value: 2 },
  { label: $t('ledger.scrapped'), value: 3 }
]);

/** yes or no status */
export const yesOrNoStatusRecord: Record<Api.Common.YesOrNoStatus, string> = {
  Y: '是',
  N: '否'
};

export const yesOrNoStatusOptions = transformRecordToOption(yesOrNoStatusRecord);

/** menu type */
export const menuTypeRecord: Record<Api.System.MenuType, string> = {
  M: '目录',
  C: '菜单',
  F: '按钮'
};

export const menuTypeOptions = transformRecordToOption(menuTypeRecord);

/** menu node type */
export const menuNodeType = {
  catalog: 1,
  menu: 2,
  button: 3,
  extLink: 4
} as const;

export const menuNodeTypeRecord: Record<Api.System.MenuNodeType, string> = {
  [menuNodeType.catalog]: '目录',
  [menuNodeType.menu]: '菜单',
  [menuNodeType.button]: '按钮',
  [menuNodeType.extLink]: '外链'
};

export const menuNodeTypeOptions: CommonType.Option<Api.System.MenuNodeType>[] = [
  { value: menuNodeType.catalog, label: menuNodeTypeRecord[menuNodeType.catalog] },
  { value: menuNodeType.menu, label: menuNodeTypeRecord[menuNodeType.menu] },
  { value: menuNodeType.button, label: menuNodeTypeRecord[menuNodeType.button] },
  { value: menuNodeType.extLink, label: menuNodeTypeRecord[menuNodeType.extLink] }
];

/** menu platform type */
export const menuPlatformType = {
  operation: 1,
  integrator: 2,
  project: 3
} as const;

/** menu is frame */
export const menuIsFrameRecord: Record<Api.System.IsMenuFrame, string> = {
  '0': '是',
  '1': '否',
  '2': 'iframe'
};

export const menuIsFrameOptions = transformRecordToOption(menuIsFrameRecord);

/** menu layout */
export const menuLayoutRecord: Record<Api.System.MenuLayout, string> = {
  '0': '默认布局',
  '1': '空白布局'
};

export const menuLayoutOptions = transformRecordToOption(menuLayoutRecord);

/** data scope */
export const dataScopeRecord: Record<Api.System.DataScope, string> = {
  '1': '全部数据权限',
  '2': '仅本人数据权限',
  '3': '本部门数据权限',
  '4': '本部门及自部门数据权限'
};

export const dataScopeOptions = transformRecordToOption(dataScopeRecord);

/** data type options */
export const DATA_TYPE_OPTIONS: SelectOption[] = [
  { label: $t('dict.data_type.number'), value: 1 },
  { label: $t('dict.data_type.switch'), value: 2 },
  { label: $t('dict.data_type.text'), value: 3 },
  { label: $t('dict.data_type.enum'), value: 4 }
];

/** precision options */
export const PRECISION_OPTIONS: SelectOption[] = [
  { label: $t('page.common.pointForm.options.precisionNone'), value: 1 },
  { label: $t('page.common.pointForm.options.precision1'), value: 2 },
  { label: $t('page.common.pointForm.options.precision2'), value: 3 },
  { label: $t('page.common.pointForm.options.precision3'), value: 4 }
];

/** energy type record */
export const energyTypeRecord = computed<Record<number, string>>(() => ({
  0: $t('page.common.pointForm.options.energyNone'),
  1: $t('page.common.pointForm.options.energyElectricity'),
  2: $t('page.common.pointForm.options.energyWater'),
  3: $t('page.common.pointForm.options.energyGas'),
  4: $t('page.common.pointForm.options.energyCooling'),
  5: $t('page.common.pointForm.options.energyHeating'),
  6: $t('page.common.pointForm.options.energyRuntime')
}));

/** energy type options */
export const ENERGY_TYPE_OPTIONS = computed(() => transformRecordToNumberOption(energyTypeRecord.value));

/** statistic granularity options */
export const STAT_TYPE_OPTIONS = computed<CommonType.Option<StatType>[]>(() => [
  { label: $t('energy.hour'), value: StatType.Hour },
  { label: $t('energy.day'), value: StatType.Day },
  { label: $t('energy.month'), value: StatType.Month },
  { label: $t('energy.year'), value: StatType.Year }
]);

export const AGG_TYPE_OPTIONS = computed<CommonType.Option<AggType>[]>(() => [
  { label: $t('effroom.last'), value: AggType.Last },
  { label: $t('effroom.average'), value: AggType.Average },
  { label: $t('effroom.difference'), value: AggType.Difference },
  { label: $t('effroom.first'), value: AggType.First }
]);

export const messageRuleTypeOptions = computed<CommonType.Option<Api.Rule.MessageRuleType>[]>(() => [
  { label: $t('messageRule.report'), value: 1 },
  { label: $t('messageRule.command'), value: 2 }
]);

/** notice type options */
export const noticeTypeOptions = computed<CommonType.Option<Api.Alarm.NoticeGroupNoticeType>[]>(() => [
  { label: $t('alarmNoticeGroup.member'), value: 1 }
]);

/** notice way options */
export const noticeWayOptions = computed<CommonType.Option<Api.Alarm.NoticeWay>[]>(() => [
  { label: $t('alarmNoticeGroup.sms'), value: 1 },
  { label: $t('alarmNoticeGroup.inApp'), value: 2 },
  { label: $t('alarmNoticeGroup.app'), value: 3 }
]);

/** unit groups */
export const UNIT_GROUPS: SelectOption[] = [
  {
    label: $t('page.common.pointForm.options.unitGroups.temperature'),
    type: 'group',
    key: 'temperature',
    children: [
      { value: '℃', label: $t('page.common.pointForm.options.units.celsius') },
      { value: '℉', label: $t('page.common.pointForm.options.units.fahrenheit') },
      { value: 'K', label: $t('page.common.pointForm.options.units.kelvin') }
    ]
  },
  {
    label: $t('page.common.pointForm.options.unitGroups.humidity'),
    type: 'group',
    key: 'humidity',
    children: [
      { value: '%RH', label: $t('page.common.pointForm.options.units.relativeHumidity') },
      { value: 'g/kg', label: $t('page.common.pointForm.options.units.humidityRatio') }
    ]
  },
  {
    label: $t('page.common.pointForm.options.unitGroups.pressure'),
    type: 'group',
    key: 'pressure',
    children: [
      { value: 'Pa', label: $t('page.common.pointForm.options.units.pascal') },
      { value: 'kPa', label: $t('page.common.pointForm.options.units.kilopascal') },
      { value: 'bar', label: $t('page.common.pointForm.options.units.bar') },
      { value: 'hPa', label: $t('page.common.pointForm.options.units.hectopascal') },
      { value: 'mbar', label: $t('page.common.pointForm.options.units.millibar') },
      { value: 'psi', label: $t('page.common.pointForm.options.units.psi') },
      { value: 'inH₂O', label: $t('page.common.pointForm.options.units.inchWater') },
      { value: 'mmHg', label: $t('page.common.pointForm.options.units.millimeterMercury') }
    ]
  },
  {
    label: $t('page.common.pointForm.options.unitGroups.electrical'),
    type: 'group',
    key: 'electrical',
    children: [
      { value: 'V', label: $t('page.common.pointForm.options.units.unit0') },
      { value: 'mV', label: $t('page.common.pointForm.options.units.unit1') },
      { value: 'kV', label: $t('page.common.pointForm.options.units.unit2') },
      { value: 'A', label: $t('page.common.pointForm.options.units.unit3') },
      { value: 'mA', label: $t('page.common.pointForm.options.units.unit4') }
    ]
  },
  {
    label: $t('page.common.pointForm.options.unitGroups.powerEnergy'),
    type: 'group',
    key: 'power-energy',
    children: [
      { value: 'W', label: $t('page.common.pointForm.options.units.unit5') },
      { value: 'mW', label: $t('page.common.pointForm.options.units.unit6') },
      { value: 'kW', label: $t('page.common.pointForm.options.units.unit7') },
      { value: 'MW', label: $t('page.common.pointForm.options.units.unit8') },
      { value: 'kWh', label: $t('page.common.pointForm.options.units.unit9') },
      { value: 'MWh', label: $t('page.common.pointForm.options.units.unit10') },
      { value: 'VA', label: $t('page.common.pointForm.options.units.unit11') },
      { value: 'kVA', label: $t('page.common.pointForm.options.units.unit12') },
      { value: 'VAR', label: $t('page.common.pointForm.options.units.unit13') },
      { value: 'kVAR', label: $t('page.common.pointForm.options.units.unit14') }
    ]
  },
  {
    label: $t('page.common.pointForm.options.unitGroups.resistance'),
    type: 'group',
    key: 'resistance',
    children: [
      { value: 'Ω', label: $t('page.common.pointForm.options.units.unit15') },
      { value: 'mΩ', label: $t('page.common.pointForm.options.units.unit16') },
      { value: 'kΩ', label: $t('page.common.pointForm.options.units.unit17') },
      { value: 'MΩ', label: $t('page.common.pointForm.options.units.unit18') },
      { value: 'PF', label: $t('page.common.pointForm.options.units.unit19') }
    ]
  },
  {
    label: $t('page.common.pointForm.options.unitGroups.flow'),
    type: 'group',
    key: 'flow',
    children: [
      { value: 'm³/s', label: $t('page.common.pointForm.options.units.unit20') },
      { value: 'm³/min', label: $t('page.common.pointForm.options.units.unit21') },
      { value: 'm³/h', label: $t('page.common.pointForm.options.units.unit22') },
      { value: 'L/s', label: $t('page.common.pointForm.options.units.unit23') },
      { value: 'L/min', label: $t('page.common.pointForm.options.units.unit24') },
      { value: 'L/h', label: $t('page.common.pointForm.options.units.unit25') },
      { value: 'CFM', label: $t('page.common.pointForm.options.units.unit26') }
    ]
  },
  {
    label: $t('page.common.pointForm.options.unitGroups.volume'),
    type: 'group',
    key: 'volume',
    children: [
      { value: 'm³', label: $t('page.common.pointForm.options.units.unit27') },
      { value: 'L', label: $t('page.common.pointForm.options.units.unit28') },
      { value: 'mL', label: $t('page.common.pointForm.options.units.unit29') },
      { value: 'ft³', label: $t('page.common.pointForm.options.units.unit30') }
    ]
  },
  {
    label: $t('page.common.pointForm.options.unitGroups.length'),
    type: 'group',
    key: 'length',
    children: [
      { value: 'm', label: $t('page.common.pointForm.options.units.unit31') },
      { value: 'cm', label: $t('page.common.pointForm.options.units.unit32') },
      { value: 'mm', label: $t('page.common.pointForm.options.units.unit33') },
      { value: 'km', label: $t('page.common.pointForm.options.units.unit34') },
      { value: 'ft', label: $t('page.common.pointForm.options.units.unit35') },
      { value: 'in', label: $t('page.common.pointForm.options.units.unit36') }
    ]
  },
  {
    label: $t('page.common.pointForm.options.unitGroups.velocity'),
    type: 'group',
    key: 'velocity',
    children: [
      { value: 'm/s', label: $t('page.common.pointForm.options.units.unit37') },
      { value: 'km/h', label: $t('page.common.pointForm.options.units.unit38') },
      { value: 'ft/min', label: $t('page.common.pointForm.options.units.unit39') }
    ]
  },
  {
    label: $t('page.common.pointForm.options.unitGroups.frequency'),
    type: 'group',
    key: 'frequency',
    children: [
      { value: 'Hz', label: $t('page.common.pointForm.options.units.unit40') },
      { value: 'kHz', label: $t('page.common.pointForm.options.units.unit41') },
      { value: 'RPM', label: $t('page.common.pointForm.options.units.unit42') }
    ]
  },
  {
    label: $t('page.common.pointForm.options.unitGroups.time'),
    type: 'group',
    key: 'time',
    children: [
      { value: 's', label: $t('page.common.pointForm.options.units.unit43') },
      { value: 'ms', label: $t('page.common.pointForm.options.units.unit44') },
      { value: 'min', label: $t('page.common.pointForm.options.units.unit45') },
      { value: 'h', label: $t('page.common.pointForm.options.units.unit46') },
      { value: 'd', label: $t('page.common.pointForm.options.units.unit47') }
    ]
  },
  {
    label: $t('page.common.pointForm.options.unitGroups.mass'),
    type: 'group',
    key: 'mass',
    children: [
      { value: 'kg', label: $t('page.common.pointForm.options.units.unit48') },
      { value: 'g', label: $t('page.common.pointForm.options.units.unit49') },
      { value: 'mg', label: $t('page.common.pointForm.options.units.unit50') },
      { value: 't', label: $t('page.common.pointForm.options.units.unit51') }
    ]
  },
  {
    label: $t('page.common.pointForm.options.unitGroups.light'),
    type: 'group',
    key: 'light',
    children: [
      { value: 'lx', label: $t('page.common.pointForm.options.units.unit52') },
      { value: 'lm', label: $t('page.common.pointForm.options.units.unit53') },
      { value: 'fc', label: $t('page.common.pointForm.options.units.unit54') },
      { value: 'cd', label: $t('page.common.pointForm.options.units.unit55') }
    ]
  },
  {
    label: $t('page.common.pointForm.options.unitGroups.concentration'),
    type: 'group',
    key: 'concentration',
    children: [
      { value: 'ppm', label: $t('page.common.pointForm.options.units.unit56') },
      { value: 'ppb', label: $t('page.common.pointForm.options.units.unit57') },
      { value: 'mg/L', label: $t('page.common.pointForm.options.units.unit58') },
      { value: 'mg/m³', label: $t('page.common.pointForm.options.units.unit59') },
      { value: 'μg/m³', label: $t('page.common.pointForm.options.units.unit60') }
    ]
  },
  {
    label: $t('page.common.pointForm.options.unitGroups.energy'),
    type: 'group',
    key: 'energy',
    children: [
      { value: 'J', label: $t('page.common.pointForm.options.units.unit61') },
      { value: 'kJ', label: $t('page.common.pointForm.options.units.unit62') },
      { value: 'MJ', label: $t('page.common.pointForm.options.units.unit63') },
      { value: 'Wh', label: $t('page.common.pointForm.options.units.unit64') },
      { value: 'BTU', label: $t('page.common.pointForm.options.units.unit65') }
    ]
  },
  {
    label: $t('page.common.pointForm.options.unitGroups.acousticsWater'),
    type: 'group',
    key: 'acoustics-water',
    children: [
      { value: 'dB', label: $t('page.common.pointForm.options.units.unit66') },
      { value: 'dBA', label: $t('page.common.pointForm.options.units.unit67') },
      { value: 'pH', label: $t('page.common.pointForm.options.units.unit68') },
      { value: 'NTU', label: $t('page.common.pointForm.options.units.unit69') }
    ]
  },
  {
    label: $t('page.common.pointForm.options.unitGroups.general'),
    type: 'group',
    key: 'general',
    children: [
      { value: '%', label: $t('page.common.pointForm.options.units.unit70') },
      { value: '°', label: $t('page.common.pointForm.options.units.unit71') },
      { value: 'rad', label: $t('page.common.pointForm.options.units.unit72') },
      { value: '-', label: $t('page.common.pointForm.options.units.unit73') }
    ]
  }
];

/** access level options */
export const ACCESS_LEVEL_OPTIONS: SelectOption[] = [
  { value: 1, label: $t('dict.access_level.readOnly') },
  { value: 2, label: $t('dict.access_level.writeOnly') },
  { value: 3, label: $t('dict.access_level.readWrite') }
];
