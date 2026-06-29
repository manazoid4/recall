import { appendFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const DEFAULT_VAULT = 'C:/Users/manaz/Desktop/Obsidian Main Vault';

export function recallPath() {
  const vault = process.env.OBSIDIAN_VAULT || DEFAULT_VAULT;
  return path.join(vault, 'Projects', 'Recall', 'Recall Inbox.md');
}

export async function appendRecall(lines: string[]) {
  if (!lines.length) return recallPath();
  const file = recallPath();
  await mkdir(path.dirname(file), { recursive: true });
  await appendFile(file, lines.join('\n') + '\n', 'utf8');
  return file;
}
