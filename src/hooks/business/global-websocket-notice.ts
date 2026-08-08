import { h } from 'vue';
import { NButton, NTag } from 'naive-ui';
import type { NotificationReactive } from 'naive-ui';
import { MessageType } from '@/enum/business';
import { useRouterPush } from '@/hooks/common/router';
import { useNoticeStore } from '@/store/modules/notice';
import { addWebSocketMessageListener, decodeWebSocketPayload, type WebSocketMessage } from '@/utils/websocket';
import type {
  AlarmLevelMeta,
  AlarmRecordNoticePayload,
  DeviceLinkStatusNoticePayload,
  GlobalWebSocketNoticeOptions,
  RoleChangeNoticePayload,
  WorkorderNoticePayload
} from '@/typings/business/global-websocket-notice';

const alarmLevelMeta: Record<number, AlarmLevelMeta> = {
  1: { label: '普通', type: 'warning' },
  2: { label: '重要', type: 'error' },
  3: { label: '紧急', type: 'error' }
};

/**
 * 创建全局通知。
 *
 * @param options 通知配置
 */
function createNotice(options: GlobalWebSocketNoticeOptions) {
  let notification: NotificationReactive | null = null;

  notification =
    window.$notification?.create({
      title: options.title,
      content: options.content,
      type: options.type,
      duration: options.duration ?? 5000,
      closable: true,
      action:
        options.onAction && options.actionText
          ? () =>
              h(
                NButton,
                {
                  secondary: true,
                  size: 'small',
                  type: options.actionType ?? 'primary',
                  onClick: () => {
                    notification?.destroy();
                    options.onAction?.();
                  }
                },
                { default: () => options.actionText }
              )
          : undefined
    }) ?? null;
}

/**
 * 渲染键值行。
 *
 * @param label 字段标签
 * @param value 字段值
 */
function renderLabelValue(label: string, value?: string | number | null) {
  return h('p', { class: 'm-0' }, [h('span', { class: 'font-600' }, label), value ?? '-']);
}

/**
 * 写入铃铛消息列表。
 *
 * @param message 消息内容
 */
function addHeaderNotice(message: string) {
  useNoticeStore().addNotice({
    message,
    read: false,
    time: new Date().toLocaleString()
  });
}

/** 注册全局 WebSocket 业务通知。 */
export function useGlobalWebSocketNotice() {
  const { routerPushByKey } = useRouterPush();

  /**
   * 处理分配工单通知。
   *
   * @param message WebSocket 消息
   */
  function handleAssigningWorkorder(message: WebSocketMessage) {
    const payload = decodeWebSocketPayload<WorkorderNoticePayload>(message.payload);
    if (!payload) return;

    addHeaderNotice(`工单待处理提醒：工单编号 ${payload.order_no ?? '-'}`);

    createNotice({
      title: '工单待处理提醒',
      type: 'warning',
      content: () => h('div', { class: 'flex-col gap-6px' }, [renderLabelValue('工单编号：', payload.order_no)]),
      actionText: '查看详情',
      actionType: 'warning',
      onAction: () => {
        void routerPushByKey('workorder_workorder-list');
      }
    });
  }

  /**
   * 处理报警记录通知。
   *
   * @param message WebSocket 消息
   */
  function handleAlarmRecord(message: WebSocketMessage) {
    const payload = decodeWebSocketPayload<AlarmRecordNoticePayload>(message.payload);
    if (!payload) return;

    const levelMeta = alarmLevelMeta[Number(payload.alarm_level)] ?? { label: '未知', type: 'default' as const };
    const recordIds = Array.isArray(payload.alarm_record_id_list) ? payload.alarm_record_id_list.join(',') : '';
    const query: Record<string, string> = {};

    if (payload.alarm_rule_id) query.alarm_rule_id = String(payload.alarm_rule_id);
    if (recordIds) query.recordIds = recordIds;

    addHeaderNotice(`设备报警提醒：${payload.alarm_rule_name || '设备报警'}，等级：${levelMeta.label}`);

    createNotice({
      title: '设备报警提醒',
      type: levelMeta.type === 'error' ? 'error' : 'warning',
      content: () =>
        h('div', { class: 'flex-col gap-8px' }, [
          h('div', { class: 'flex items-center justify-between gap-12px' }, [
            h('span', { class: 'font-600 text-15px' }, payload.alarm_rule_name || '设备报警'),
            h(NTag, { round: true, size: 'small', type: levelMeta.type }, { default: () => `等级：${levelMeta.label}` })
          ]),
          h('span', { class: 'text-13px text-gray-500' }, '请及时处理报警')
        ]),
      actionText: '去处理',
      actionType: 'error',
      onAction: () => {
        void routerPushByKey('alarm_record', {
          query
        });
      }
    });
  }

  /**
   * 处理角色变更通知。
   *
   * @param message WebSocket 消息
   */
  function handleRoleChange(message: WebSocketMessage) {
    const payload = decodeWebSocketPayload<RoleChangeNoticePayload>(message.payload);
    const roleName = payload?.new_role?.role_name || '未知角色';

    addHeaderNotice(`角色变更提醒：新角色为 ${roleName}`);

    const refreshApp = () => {
      void routerPushByKey('home')
        .catch(() => undefined)
        .finally(() => {
          window.location.reload();
        });
    };

    if (window.$dialog) {
      window.$dialog.warning({
        title: '角色变更提醒',
        content: `您的角色已发生改变，新角色为：${roleName}，点击确定后刷新！`,
        positiveText: '确定',
        onPositiveClick: refreshApp
      });
      return;
    }

    createNotice({
      title: '角色变更提醒',
      content: `您的角色已发生改变，新角色为：${roleName}，点击确定后刷新！`,
      type: 'warning',
      duration: 0,
      actionText: '确定',
      actionType: 'warning',
      onAction: refreshApp
    });
  }

  /**
   * 处理设备上下线通知。
   *
   * @param message WebSocket 消息
   */
  function handleDeviceLinkStatus(message: WebSocketMessage) {
    const payload = decodeWebSocketPayload<DeviceLinkStatusNoticePayload>(message.payload);
    if (!payload) return;

    const isOnline = Number(payload.link_status) === 2;
    const actionText = payload.device_id ? '查看设备详情' : undefined;
    const deviceStatusText = isOnline ? '已上线' : '已下线';

    addHeaderNotice(`设备${isOnline ? '上线' : '下线'}提醒：${payload.device_name || '-'}${deviceStatusText}`);

    createNotice({
      title: `设备${isOnline ? '上线' : '下线'}提醒`,
      type: isOnline ? 'success' : 'info',
      content: () =>
        h('div', { class: 'flex-col gap-6px' }, [
          h('p', { class: 'm-0' }, [
            '设备：',
            h(
              'span',
              { class: isOnline ? 'font-600 text-success' : 'font-600 text-gray-500' },
              payload.device_name || '-'
            ),
            deviceStatusText
          ])
        ]),
      actionText,
      actionType: isOnline ? 'success' : 'default',
      onAction: payload.device_id
        ? () => {
            void routerPushByKey('device_device-detail', {
              query: {
                id: String(payload.device_id)
              }
            });
          }
        : undefined
    });
  }

  /** 注册并返回全局通知注销函数。 */
  function registerGlobalWebSocketNotice() {
    const removeListeners = [
      addWebSocketMessageListener(MessageType.AssigningWorkorder, handleAssigningWorkorder),
      addWebSocketMessageListener(MessageType.AlertAlarmRecord, handleAlarmRecord),
      addWebSocketMessageListener(MessageType.SysUserPermChange, handleRoleChange),
      addWebSocketMessageListener(MessageType.DeviceLinkStatus, handleDeviceLinkStatus)
    ];

    return () => {
      removeListeners.forEach(remove => remove());
    };
  }

  return {
    registerGlobalWebSocketNotice
  };
}
