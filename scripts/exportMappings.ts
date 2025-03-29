import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import { writeFileSync } from 'fs';
import { join } from 'path';

const db = new sqlite3.Database(join(process.cwd(), 'db', 'mappings.db'));
const all = promisify(db.all).bind(db);

async function exportMappings() {
  try {
    const rows = await all('SELECT target, channel FROM target_mappings') as Array<{target: string, channel: string}>;
    const mappings = rows.reduce((acc: Record<string, string>, row: {target: string, channel: string}) => {
      acc[row.target] = row.channel;
      return acc;
    }, {} as Record<string, string>);

    writeFileSync(
      join(process.cwd(), 'config', 'targetMappings.json'),
      JSON.stringify(mappings, null, 2)
    );
    console.log('Mappings exported to config/targetMappings.json');
  } catch (error) {
    console.error('Error exporting mappings:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

exportMappings();