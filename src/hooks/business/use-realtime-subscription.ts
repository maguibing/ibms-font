import { onBeforeUnmount } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import { useEventListener } from '@vueuse/core';
import { RealTimeType } from '@/enum/business';

type RealtimeMessageSender = (realTimeType: RealTimeType) => void;

/**
 * 实时订阅生命周期管理
 *
 * @param sendRealtimeMessage - 发送实时订阅消息
 * @returns 订阅控制方法
 */
export function useRealtimeSubscription(sendRealtimeMessage: RealtimeMessageSender) {
  let active = true;
  let subscribed = false;
  let unsubscribed = false;

  function subscribe() {
    if (!active) return;

    sendRealtimeMessage(RealTimeType.Sub);
    subscribed = true;
    unsubscribed = false;
  }

  function unsubscribe() {
    if (!subscribed || unsubscribed) return;

    sendRealtimeMessage(RealTimeType.Unsub);
    subscribed = false;
    unsubscribed = true;
  }

  function dispose() {
    active = false;
    unsubscribe();
  }

  useEventListener(window, 'pagehide', dispose);
  useEventListener(window, 'beforeunload', dispose);

  onBeforeRouteLeave(() => {
    dispose();
  });

  onBeforeUnmount(dispose);

  return {
    subscribe,
    unsubscribe,
    dispose,
    isActive: () => active
  };
}
