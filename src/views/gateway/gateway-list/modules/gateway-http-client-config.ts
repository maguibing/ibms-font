export const httpMethodOptions = ['POST', 'GET', 'PUT', 'DELETE', 'PATCH'];

/** HTTP 请求内容类型选项。 */
export const contentTypeOptions: CommonType.Option<string, string>[] = [
  { label: 'application/json', value: 'application/json' },
  { label: 'application/x-www-form-urlencoded', value: 'application/x-www-form-urlencoded' },
  { label: 'multipart/form-data', value: 'multipart/form-data' }
];

export const tokenPlacementOptions: CommonType.Option<Api.Gateway.TokenPlacement, string>[] = [
  { label: '标准认证头（Bearer Token）', value: 1 },
  { label: '标准认证头（Raw Token）', value: 2 },
  { label: '自定义请求头（Header）', value: 3 },
  { label: 'URL 查询参数（Query）', value: 4 },
  { label: '请求体参数（Body）', value: 5 }
];

const tokenKeyFixedByPlacement: Partial<Record<Api.Gateway.TokenPlacement, string>> = {
  1: 'Authorization Bearer',
  2: 'Authorization'
};

export const httpMethodSelectOptions = httpMethodOptions.map(method => ({
  label: method,
  value: method
}));

/** 规范化认证令牌位置，异常值回退到标准认证头。 */
export function normalizeTokenPlacement(placement: unknown): Api.Gateway.TokenPlacement {
  const numericPlacement = Number(placement);

  return [1, 2, 3, 4, 5].includes(numericPlacement) ? (numericPlacement as Api.Gateway.TokenPlacement) : 1;
}

/** 获取认证位置对应的固定令牌字段名。 */
export function getFixedTokenKey(placement: Api.Gateway.TokenPlacement) {
  return tokenKeyFixedByPlacement[placement] || '';
}

/** 创建动态键值输入行。 */
export function createGatewayHttpClientKeyValueRow(): Api.Gateway.GatewayHttpClientKeyValueRow {
  return {
    key: '',
    value: ''
  };
}

/** 判断令牌字段是否由认证位置自动决定。 */
export function isTokenKeyReadonly(placement: Api.Gateway.TokenPlacement) {
  return [1, 2].includes(placement);
}

/** 判断认证位置是否为默认值。 */
export function isNilTokenPlacement(placement: Api.Gateway.TokenPlacement | null | undefined) {
  return !placement || placement === 1;
}

/** 判断动态键值行是否只填写了一侧。 */
export function isIncompleteGatewayHttpClientKeyValueRow(row: Api.Gateway.GatewayHttpClientKeyValueRow) {
  const key = row.key.trim();
  const value = row.value.trim();

  return Boolean((key && !value) || (!key && value));
}

/** 计算路由是否完整，以及是否被用户部分填写。 */
export function getGatewayHttpClientRouteState(route: Api.Gateway.GatewayHttpClientRouteModel) {
  const method = route.method.trim();
  const hasNonDefaultMethod = Boolean(method) && method !== 'POST';
  const path = route.path.trim();
  const tokenKey = route.token_key.trim();
  const withAuth = route.with_auth === true;
  const hasNonDefaultTokenPlacement = !isNilTokenPlacement(route.token_placement);
  const touched = Boolean(hasNonDefaultMethod || path || tokenKey || hasNonDefaultTokenPlacement);
  const authValid = withAuth ? Boolean(tokenKey) : tokenKey === '';
  const complete = Boolean(method && path && authValid);

  return {
    complete,
    incomplete: touched && !complete,
    tokenKey,
    withAuth
  };
}

/** 根据认证开关和位置同步令牌字段。 */
export function syncGatewayHttpClientRouteTokenPlacement(route: Api.Gateway.GatewayHttpClientRouteModel) {
  route.token_placement = normalizeTokenPlacement(route.token_placement);

  if (!route.with_auth) {
    route.token_key = '';
    route.token_placement = 1;
    return;
  }

  if (isTokenKeyReadonly(route.token_placement)) {
    route.token_key = getFixedTokenKey(route.token_placement);
  } else {
    route.token_key ||= '';
  }
}

/** 创建 HTTP Client 路由的默认表单模型。 */
export function createGatewayHttpClientRouteModel(): Api.Gateway.GatewayHttpClientRouteModel {
  return {
    body: [],
    content_type: 'application/json',
    headers: [],
    method: 'POST',
    path: '',
    token_key: '',
    token_placement: 1,
    with_auth: false
  };
}

/** 创建 HTTP Client 配置的默认表单模型。 */
export function createGatewayHttpClientModel(): Api.Gateway.GatewayHttpClientModel {
  return {
    is_support_send: true,
    poll_interval: 5,
    poll_route: createGatewayHttpClientRouteModel(),
    send_route: createGatewayHttpClientRouteModel(),
    server: '',
    timeout: 10,
    token: {
      body: [],
      content_type: 'application/json',
      expire_field: '',
      expire_seconds: 600,
      headers: [],
      is_enable: false,
      method: 'POST',
      path: '',
      token_field: ''
    }
  };
}

/** 将动态键值行转换为接口使用的对象。 */
export function gatewayHttpClientKeyValueRowsToMap(rows: Api.Gateway.GatewayHttpClientKeyValueRow[]) {
  return rows.reduce<Record<string, string>>((acc, row) => {
    const key = row.key.trim();
    const value = row.value.trim();

    if (key && value) {
      acc[key] = value;
    }

    return acc;
  }, {});
}

/** 生成路由提交参数，可按需省略请求体。 */
export function createGatewayHttpClientRouteParams(
  route: Api.Gateway.GatewayHttpClientRouteModel,
  options: { includeBody?: boolean } = {}
): Api.Gateway.GatewayHttpClientRoute {
  const params: Api.Gateway.GatewayHttpClientRoute = {
    content_type: route.content_type,
    headers: gatewayHttpClientKeyValueRowsToMap(route.headers),
    method: route.method,
    path: route.path,
    token_key: route.with_auth ? route.token_key : '',
    token_placement: route.with_auth ? route.token_placement : 1,
    with_auth: route.with_auth
  };

  if (options.includeBody !== false) {
    params.body = gatewayHttpClientKeyValueRowsToMap(route.body);
  }

  return params;
}
