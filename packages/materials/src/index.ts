import AdminLayout, { LAYOUT_MAX_Z_INDEX, LAYOUT_SCROLL_EL_ID } from './libs/admin-layout';
import PageTab from './libs/page-tab';
import SimpleScrollbar from './libs/simple-scrollbar';
import StatusTag from './libs/status-tag';

export { AdminLayout, LAYOUT_SCROLL_EL_ID, LAYOUT_MAX_Z_INDEX, PageTab, SimpleScrollbar, StatusTag };
export type {
  StatusTagMap,
  StatusTagOption,
  StatusTagPreset,
  StatusTagProps,
  StatusTagType,
  StatusTagValue
} from './libs/status-tag';
export * from './types';
