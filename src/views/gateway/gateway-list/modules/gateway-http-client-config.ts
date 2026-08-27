export const httpMethodOptions = ['POST', 'GET', 'PUT', 'DELETE', 'PATCH'];

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

export function normalizeTokenPlacement(placement: unknown): Api.Gateway.TokenPlacement {
  const numericPlacement = Number(placement);

  return [1, 2, 3, 4, 5].includes(numericPlacement) ? (numericPlacement as Api.Gateway.TokenPlacement) : 1;
}

export function getFixedTokenKey(placement: Api.Gateway.TokenPlacement) {
  return tokenKeyFixedByPlacement[placement] || '';
}

export function createGatewayHttpClientKeyValueRow(): Api.Gateway.GatewayHttpClientKeyValueRow {
  return {
    key: '',
    value: ''
  };
}

export function isTokenKeyReadonly(placement: Api.Gateway.TokenPlacement) {
  return [1, 2].includes(placement);
}

export function isNilTokenPlacement(placement: Api.Gateway.TokenPlacement | null | undefined) {
  return !placement || placement === 1;
}

export function isIncompleteGatewayHttpClientKeyValueRow(row: Api.Gateway.GatewayHttpClientKeyValueRow) {
  const key = row.key.trim();
  const value = row.value.trim();

  return Boolean((key && !value) || (!key && value));
}

export function getGatewayHttpClientRouteState(route: Api.Gateway.GatewayHttpClientRouteModel) {
  const method = route.method.trim();
  const hasNonDefaultMethod = Boolean(method) && method !== 'POST';
  const path = route.path.trim();
  const tokenKey = route.token_key.trim();
  const withAuth = route.with_auth !== false;
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

export function createGatewayHttpClientRouteModel(): Api.Gateway.GatewayHttpClientRouteModel {
  return {
    method: 'POST',
    path: '',
    token_key: '',
    token_placement: 1,
    with_auth: false
  };
}

export function createGatewayHttpClientModel(): Api.Gateway.GatewayHttpClientModel {
  return {
    poll_interval: 5,
    poll_route: createGatewayHttpClientRouteModel(),
    send_route: createGatewayHttpClientRouteModel(),
    server: '',
    timeout: 10,
    token: {
      body: [],
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

export function createGatewayHttpClientRouteParams(
  route: Api.Gateway.GatewayHttpClientRouteModel
): Api.Gateway.GatewayHttpClientRoute {
  return {
    method: route.method,
    path: route.path,
    token_key: route.with_auth ? route.token_key : '',
    token_placement: route.with_auth ? route.token_placement : 1,
    with_auth: route.with_auth
  };
}
