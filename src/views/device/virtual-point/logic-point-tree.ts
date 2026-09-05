import { fetchGetLogicPointTree } from '@/service/api/device';

const CACHE_DURATION = 1000;

let cachedTree: Api.Device.LogicPointTreeNode[] = [];
let cacheExpiresAt = 0;
let pendingRequest: Promise<Api.Device.LogicPointTreeNode[]> | null = null;

/** Recursively extract numeric point nodes from the device tree. */
export function collectVirtualPointLogicPointNodes(
  nodes: Api.Device.LogicPointTreeNode[]
): Api.Device.LogicPointTreeNode[] {
  return nodes.flatMap(node => {
    const children = collectVirtualPointLogicPointNodes(node.children ?? []);
    return node.type === 3 ? [node, ...children] : children;
  });
}

/** Reuse the numeric point tree request to avoid duplicate requests when switching modes quickly. */
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
