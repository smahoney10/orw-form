export function normalizeWorkspaceHost(host) {
  const value = (host || '').trim();
  if (!value) return '';

  try {
    const parsed = new URL(value.startsWith('http') ? value : `https://${value}`);
    return parsed.host;
  } catch {
    return value.replace(/^https?:\/\//i, '').split('/')[0].replace(/\/+$/, '');
  }
}

export function buildDatabricksWorkspaceUrl(host, path, format = 'SOURCE') {
  const normalizedHost = normalizeWorkspaceHost(host);
  const normalizedPath = (path || '').trim();

  if (!normalizedHost) {
    throw new Error('Workspace host is required');
  }

  if (!normalizedPath) {
    throw new Error('Workspace path is required');
  }

  const url = new URL(`https://${normalizedHost}/api/2.0/workspace/export`);
  url.searchParams.set('path', normalizedPath);
  url.searchParams.set('format', format);
  return url.toString();
}

export async function fetchDatabricksWorkspaceContent({ workspaceHost, token, path }) {
  const url = buildDatabricksWorkspaceUrl(workspaceHost, path);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'text/plain',
    },
  });

  if (!response.ok) {
    const bodyText = await response.text().catch(() => '');
    throw new Error(`${response.status} ${response.statusText}${bodyText ? `: ${bodyText}` : ''}`.trim());
  }

  return response.text();
}

export function tryParseJsonContent(text) {
  if (!text) return null;

  const trimmed = text.trim();
  if (!trimmed) return null;

  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
}

export function parsePythonCode(text) {
  if (!text) return '';
  return text.trim();
}
