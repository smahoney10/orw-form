const STORAGE_KEY = 'orw-databricks-token';

export function saveDatabricksToken(token) {
  if (!token) return;
  localStorage.setItem(STORAGE_KEY, token);
}

export function loadDatabricksToken() {
  return localStorage.getItem(STORAGE_KEY) || '';
}

export function clearDatabricksToken() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getDatabricksOAuthUrl({ workspaceHost, clientId, redirectUri, scopes = ['offline_access', 'sql'] }) {
  const host = (workspaceHost || '').trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '');
  if (!host) throw new Error('Workspace host is required');
  if (!clientId) throw new Error('Client ID is required');

  const params = new URLSearchParams({
    response_type: 'token',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: scopes.join(' '),
    state: 'orw-databricks-auth',
  });

  return `https://${host}/oidc/oauth2/authorize?${params.toString()}`;
}

export function extractHashToken(hash) {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  return params.get('access_token') || '';
}
