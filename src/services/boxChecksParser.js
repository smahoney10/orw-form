export function extractBoxCheckDescriptions(pythonCode = '') {
  if (!pythonCode) return [];

  return pythonCode
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const commentMatch = line.match(/(?:^|\s)#\s*(check\s*\d+[^\n]*)/i);
      if (commentMatch) {
        return commentMatch[1].replace(/^check\s*/i, 'Check ').trim();
      }

      const inlineMatch = line.match(/\b(check\s*\d+[^\n]*)/i);
      if (inlineMatch) {
        return inlineMatch[1].replace(/^check\s*/i, 'Check ').trim();
      }

      return '';
    })
    .filter((line) => line.length > 0)
    .slice(0, 50);
}
