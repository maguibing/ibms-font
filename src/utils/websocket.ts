import { useWebSocket } from '@vueuse/core';
import { MessageType } from '@/enum/business';
import { useNoticeStore } from '@/store/modules/notice';
import { localStg } from './storage';

export type WebSocketMessage = {
  type: MessageType;
  payload?: string;
  connection_id?: string;
};

export type SendWebSocketMessageParams = {
  type: MessageType;
  payload: unknown;
};

type PendingWebSocketMessage = Required<Pick<WebSocketMessage, 'payload' | 'type'>>;
type WebSocketMessageListener = (message: WebSocketMessage) => void;

let socketClient: ReturnType<typeof useWebSocket> | null = null;
let activeSocketUrl = '';
let connectionId = '';
const pendingWebSocketMessages: PendingWebSocketMessage[] = [];
const webSocketMessageListeners = new Map<MessageType, Set<WebSocketMessageListener>>();

function encodeTextToBase64(text: string) {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  bytes.forEach(byte => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary);
}

function decodeBase64ToText(payload: string) {
  const binary = atob(payload);
  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));

  return new TextDecoder().decode(bytes);
}

function encodeWebSocketPayload(payload: unknown) {
  return encodeTextToBase64(JSON.stringify(payload ?? null));
}

function sendPreparedWebSocketMessage(message: PendingWebSocketMessage) {
  if (!socketClient || !connectionId) {
    pendingWebSocketMessages.push(message);
    return false;
  }

  return socketClient.send(
    JSON.stringify({
      connection_id: connectionId,
      ...message
    })
  );
}

function flushPendingWebSocketMessages() {
  if (!connectionId) return;

  const messages = pendingWebSocketMessages.splice(0);
  messages.forEach(message => sendPreparedWebSocketMessage(message));
}

function parseWebSocketMessage(data: string) {
  try {
    return JSON.parse(data) as WebSocketMessage;
  } catch {
    return null;
  }
}

function dispatchWebSocketMessage(message: WebSocketMessage) {
  const listeners = webSocketMessageListeners.get(message.type);
  if (!listeners?.size) return false;

  listeners.forEach(listener => listener(message));

  return true;
}

function handleConnectionMessage(message: WebSocketMessage) {
  if (message.type !== MessageType.UniqueIdentity || !message.connection_id) return false;

  connectionId = message.connection_id;
  flushPendingWebSocketMessages();

  return true;
}

function notifyWebSocketMessage(message: string) {
  useNoticeStore().addNotice({
    message,
    read: false,
    time: new Date().toLocaleString()
  });

  window.$notification?.create({
    title: '消息',
    content: message,
    type: 'success',
    duration: 3000
  });
}

export function sendWebSocketMessage({ type, payload }: SendWebSocketMessageParams) {
  if (import.meta.env.VITE_APP_WEBSOCKET === 'N') {
    return false;
  }

  return sendPreparedWebSocketMessage({
    payload: encodeWebSocketPayload(payload),
    type
  });
}

export function addWebSocketMessageListener(type: MessageType, listener: WebSocketMessageListener) {
  const listeners = webSocketMessageListeners.get(type) ?? new Set<WebSocketMessageListener>();
  listeners.add(listener);
  webSocketMessageListeners.set(type, listeners);

  return () => {
    listeners.delete(listener);
    if (!listeners.size) webSocketMessageListeners.delete(type);
  };
}

export function decodeWebSocketPayload<T>(payload?: string) {
  if (!payload) return null;

  try {
    return JSON.parse(decodeBase64ToText(payload)) as T;
  } catch {
    return null;
  }
}

/**
 * 初始化 WebSocket
 *
 * @param url - WebSocket 地址
 */
export const initWebSocket = (url: string) => {
  const token = localStg.get('token');
  if (import.meta.env.VITE_APP_WEBSOCKET === 'N' || !token) {
    socketClient?.close();
    socketClient = null;
    activeSocketUrl = '';
    connectionId = '';
    pendingWebSocketMessages.length = 0;
    return;
  }
  const separator = url.includes('?') ? '&' : '?';
  const socketUrl = `${url}${separator}token=${encodeURIComponent(`${token}`)}`;
  if (socketClient && activeSocketUrl === socketUrl && socketClient.status.value !== 'CLOSED') {
    return;
  }
  socketClient?.close();
  activeSocketUrl = socketUrl;
  connectionId = '';
  socketClient = useWebSocket(socketUrl, {
    autoReconnect: {
      // 重连最大次数
      retries: 3,
      // 重连间隔
      delay: 1000,
      onFailed() {
        // eslint-disable-next-line no-console
        console.warn('WebSocket 重连失败');
      }
    },
    // heartbeat: {
    //   message: JSON.stringify({ type: 'ping' }),
    //   // 发送心跳的间隔
    //   interval: 10000,
    //   // 接收到心跳response的超时时间
    //   pongTimeout: 2000
    // },
    onConnected() {
      // eslint-disable-next-line no-console
      console.log('WebSocket 已经连接');
    },
    onDisconnected() {
      connectionId = '';
      // eslint-disable-next-line no-console
      console.warn('WebSocket 已经断开连接');
    },
    onMessage: (_, e) => {
      if (e.data.indexOf('ping') > 0) {
        return;
      }

      const message = parseWebSocketMessage(e.data);
      if (!message) {
        notifyWebSocketMessage(e.data);
        return;
      }
      if (handleConnectionMessage(message)) {
        return;
      }

      dispatchWebSocketMessage(message);
      if (message.type === MessageType.DevicePointRealTimeData) {
        return;
      }

      notifyWebSocketMessage(e.data);
    }
  });
};
