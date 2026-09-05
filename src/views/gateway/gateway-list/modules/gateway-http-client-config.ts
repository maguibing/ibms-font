import { computed } from 'vue';
import { $t } from '@/locales';

export const httpMethodOptions = ['POST', 'GET', 'PUT', 'DELETE', 'PATCH'];

/** HTTP request content type options. */
export const contentTypeOptions: CommonType.Option<string, string>[] = [
  { label: 'application/json', value: 'application/json' },
  { label: 'application/x-www-form-urlencoded', value: 'application/x-www-form-urlencoded' },
  { label: 'multipart/form-data', value: 'multipart/form-data' }
];

export const tokenPlacementOptions = computed<CommonType.Option<Api.Gateway.TokenPlacement, string>[]>(() => [
  { label: $t('gatewayList.bearerToken'), value: 1 },
  { label: $t('gatewayList.rawToken'), value: 2 },
  { label: $t('gatewayList.headerToken'), value: 3 },
  { label: $t('gatewayList.queryToken'), value: 4 },
  { label: $t('gatewayList.bodyToken'), value: 5 }
]);

const tokenKeyFixedByPlacement: Partial<Record<Api.Gateway.TokenPlacement, string>> = {
  1: 'Authorization Bearer',
  2: 'Authorization'
};

export const httpMethodSelectOptions = httpMethodOptions.map(method => ({
  label: method,
  value: method
}));

/** Normalize token placement and fall back to the standard auth header for invalid values. */
export function normalizeTokenPlacement(placement: unknown): Api.Gateway.TokenPlacement {
  const numericPlacement = Number(placement);

  return [1, 2, 3, 4, 5].includes(numericPlacement) ? (numericPlacement as Api.Gateway.TokenPlacement) : 1;
}

/** Get the fixed token key for the auth placement. */
export function getFixedTokenKey(placement: Api.Gateway.TokenPlacement) {
  return tokenKeyFixedByPlacement[placement] || '';
}

/** Create a dynamic key-value row. */
export function createGatewayHttpClientKeyValueRow(): Api.Gateway.GatewayHttpClientKeyValueRow {
  return {
    key: '',
    value: ''
  };
}

/** Check whether the token key is controlled by the auth placement. */
export function isTokenKeyReadonly(placement: Api.Gateway.TokenPlacement) {
  return [1, 2].includes(placement);
}

/** Check whether the auth placement is the default value. */
export function isNilTokenPlacement(placement: Api.Gateway.TokenPlacement | null | undefined) {
  return !placement || placement === 1;
}

/** Check whether a dynamic key-value row is only partially filled. */
export function isIncompleteGatewayHttpClientKeyValueRow(row: Api.Gateway.GatewayHttpClientKeyValueRow) {
  const key = row.key.trim();
  const value = row.value.trim();

  return Boolean((key && !value) || (!key && value));
}

/** Check whether a route is complete and whether the user has partially filled it. */
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

/** Sync the token key with the auth toggle and placement. */
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

/** Create the default HTTP Client route model. */
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

/** Create the default HTTP Client config model. */
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

/** Convert dynamic key-value rows into the payload shape used by the API. */
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

/** Build route submit params and optionally omit the request body. */
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
