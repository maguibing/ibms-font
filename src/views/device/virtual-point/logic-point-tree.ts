import { fetchGetLogicPointTree } from '@/service/api/device';

const CACHE_DURATION = 1000;

let cachedTree: Api.Device.LogicPointTreeNode[] = [];
let cacheExpiresAt = 0;
let pendingRequest: Promise<Api.Device.LogicPointTreeNode[]> | null = null;

/** 递归提取设备树中的数字点位节点。 */
export function collectVirtualPointLogicPointNodes(
  nodes: Api.Device.LogicPointTreeNode[]
): Api.Device.LogicPointTreeNode[] {
  return nodes.flatMap(node => {
    const children = collectVirtualPointLogicPointNodes(node.children ?? []);
    return node.type === 3 ? [node, ...children] : children;
  });
}

/** 复用虚点配置中的数字点位树请求，避免快速切换模式时重复提交。 */
export function getVirtualPointLogicPointTree() {
  if (Date.now() < cacheExpiresAt) return Promise.resolve(cachedTree);
  if (pendingRequest) return pendingRequest;

  pendingRequest = fetchGetLogicPointTree({
    data_type_list: [1],
    filter_device_type: true
  })
    .then(({ data, error }) => {
      if (error) return [];

      cachedTree = data?.trees ?? [];
      cacheExpiresAt = Date.now() + CACHE_DURATION;
      return cachedTree;
    })
    .finally(() => {
      pendingRequest = null;
    });

  return pendingRequest;
}
