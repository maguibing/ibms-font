import type { SelectOption } from 'naive-ui';

export const operateTypeOptions: SelectOption[] = [
  { label: '登录', value: '1' },
  { label: '登出', value: '2' },
  { label: '导入', value: '3' },
  { label: '导出', value: '4' },
  { label: '创建', value: '5' },
  { label: '更新', value: '6' },
  { label: '删除', value: '7' },
  { label: '分配', value: '8' },
  { label: '审核', value: '9' },
  { label: '其他', value: '100' },
];

export const operateModuleOptions: SelectOption[] = [
  { label: '系统', value: '1' },
  { label: '用户', value: '2' },
  { label: '部门', value: '3' },
  { label: '角色', value: '4' },
  { label: '项目', value: '5' },
  { label: '边缘设备', value: '6' },
  { label: '设备类型', value: '7' },
  { label: '设备', value: '8' },
  { label: '点位', value: '9' },
  { label: '消息规则', value: '10' },
  { label: '任务', value: '11' },
  { label: '台账', value: '12' },
  { label: '报警', value: '13' },
  { label: '工单', value: '14' },
  { label: '组态', value: '15' },
  { label: '自定义大屏', value: '16' },
];
