export function extractBoxCheckDescriptions(pythonCode = '') {
  if (!pythonCode) return [];

  const lines = pythonCode.split(/\r?\n/);
  const checks = [];
  let current = null;

  const flush = () => {
    if (!current) return;
    const cleaned = current.text
      .replace(/^\s*#\s*/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (cleaned) {
      checks.push(`${current.label}: ${cleaned}`);
    }
    current = null;
  };

  for (const line of lines) {
    const trimmed = line.trim();

    const checkMatch = trimmed.match(/^#\s*(Check\s*\d+)(?:\s*[:-]\s*(.*))?$/i);
    if (checkMatch) {
      flush();
      current = {
        label: checkMatch[1].replace(/^check\s*/i, 'Check '),
        text: checkMatch[2] ? checkMatch[2].trim() : '',
      };
      continue;
    }

    if (current) {
      const commentText = trimmed.match(/^#\s*(.+)$/);
      if (commentText) {
        const text = commentText[1].trim();
        if (text) {
          current.text = current.text ? `${current.text} ${text}` : text;
        }
      }
    }
  }

  flush();

  return checks;
}
