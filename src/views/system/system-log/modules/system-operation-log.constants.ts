import type { SelectOption } from 'naive-ui';
import { $t } from '@/locales';

export const operateTypeOptions: SelectOption[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '100'].map(value => ({
  label: $t(`systemLog.operateTypeOptions.${value}` as App.I18n.I18nKey),
  value
}));

export const operateModuleOptions: SelectOption[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'].map(value => ({
  label: $t(`systemLog.operateModuleOptions.${value}` as App.I18n.I18nKey),
  value
}));
