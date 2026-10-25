import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { LasairClient, formatCoordinates, getLasairObjectUrl, type RubinTransientCandidate } from '../src/index';

// Load .env using Node 20+ built-in loader if present
const envPath = resolve(process.cwd(), '.env');
if (existsSync(envPath)) {
  process.loadEnvFile(envPath);
}

const token = process.env.LASAIR_TOKEN;
if (!token) {
  console.error('Error: LASAIR_TOKEN is missing! Please check your environment or .env file.');
  process.exit(1);
}

const client = new LasairClient({ token });

async function runScout(): Promise<void> {
  console.log('Connecting to Lasair Rubin Stream via @skyscout/lasair-client...');

  const selected = 'objects.diaObjectId, objects.ra, objects.decl, objects.lastDiaSourceMjdTai, sherlock_classifications.classification';
  const tables = 'objects, sherlock_classifications';
  const conditions =
    "objects.diaObjectId = sherlock_classifications.diaObjectId " +
    "AND sherlock_classifications.classification IN ('SN', 'NT', 'CV') " +
    "ORDER BY objects.lastDiaSourceMjdTai DESC";

  try {
    const results = await client.query<RubinTransientCandidate>({
      selected,
      tables,
      conditions,
      limit: 10,
    });

    if (!results || results.length === 0) {
      console.log('No transient candidates returned.');
      return;
    }

    console.log(`\nRetrieved ${results.length} events from Rubin stream:\n`);
    console.log(
      `${'#'.padEnd(3)} | ${'ID'.padEnd(20)} | ${'Type'.padEnd(6)} | ${'RA'.padEnd(10)} | ${'Dec'.padEnd(10)} | ${'MJD'.padEnd(10)} | Lasair Link`
    );
    console.log('-'.repeat(108));

    for (let i = 0; i < results.length; i++) {
      const obj = results[i];
      const objId = String(obj.diaObjectId ?? 'N/A');
      const cls = String(obj.classification ?? 'Unknown');
      const { raStr, decStr } = formatCoordinates(Number(obj.ra), Number(obj.decl));
      const mjdStr = obj.lastDiaSourceMjdTai ? Number(obj.lastDiaSourceMjdTai).toFixed(2) : 'N/A';
      const link = getLasairObjectUrl(objId);

      console.log(
        `${String(i + 1).padEnd(3)} | ${objId.padEnd(20)} | ${cls.padEnd(6)} | ${raStr.padEnd(10)} | ${decStr.padEnd(10)} | ${mjdStr.padEnd(10)} | ${link}`
      );
    }
  } catch (err) {
    console.error('Query error:', err);
    process.exit(1);
  }
}

runScout();
