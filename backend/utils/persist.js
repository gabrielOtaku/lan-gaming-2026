import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR  = path.join(__dirname, '..', 'data');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

export function loadJSON(filename, defaults) {
  const fp = path.join(DATA_DIR, filename);
  try {
    return JSON.parse(fs.readFileSync(fp, 'utf8'));
  } catch {
    return defaults;
  }
}

export function saveJSON(filename, data) {
  const fp = path.join(DATA_DIR, filename);
  fs.writeFileSync(fp, JSON.stringify(data, null, 2), 'utf8');
}
