export async function fetchGitFileContent({ repoUrl, filePath, branch = 'main' }) {
  if (!repoUrl || !filePath) {
    throw new Error('Repository URL and file path are required');
  }

  const normalizedRepo = repoUrl.replace(/\/$/, '');
  const rawUrl = normalizedRepo.includes('github.com')
    ? `${normalizedRepo}/raw/${branch}/${filePath.replace(/^\//, '')}`
    : normalizedRepo.includes('gitlab.com')
      ? `${normalizedRepo}/-/raw/${branch}/${filePath.replace(/^\//, '')}`
      : null;

  if (!rawUrl) {
    throw new Error('Only GitHub and GitLab repository URLs are supported');
  }

  const response = await fetch(rawUrl);
  if (!response.ok) {
    throw new Error(`Unable to fetch file from Git repository (${response.status})`);
  }

  return response.text();
}
