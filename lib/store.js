const fs = require("fs");
const path = require("path");
const { buildSeed } = require("./seed");

const STORE_NAME = "mini-emr-data";
const DB_KEY = "database";
const LOCAL_DB_PATH = path.join(process.cwd(), "data", "db.local.json");

// Netlify Blobs must be initialized *inside* a request handler (not at
// module load time) so that Netlify's automatically-injected environment
// context is available. We lazily require it here so local `next dev`
// (which doesn't have @netlify/blobs configured) never touches it unless
// we're actually running on Netlify.
async function getBlobStore() {
  try {
    const { getStore } = require("@netlify/blobs");
    return getStore({ name: STORE_NAME, consistency: "strong" });
  } catch (err) {
    return null;
  }
}

function readLocalFile() {
  if (!fs.existsSync(LOCAL_DB_PATH)) return null;
  try {
    const raw = fs.readFileSync(LOCAL_DB_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}

function writeLocalFile(db) {
  fs.mkdirSync(path.dirname(LOCAL_DB_PATH), { recursive: true });
  fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

// Reads the database, seeding it on first run.
async function getDB() {
  const store = await getBlobStore();

  if (store) {
    try {
      const existing = await store.get(DB_KEY, { type: "json" });
      if (existing) return existing;
      const seeded = buildSeed();
      await store.setJSON(DB_KEY, seeded);
      return seeded;
    } catch (err) {
      // Blobs isn't actually configured in this environment (e.g. running
      // `next dev` without `netlify dev`) - fall back to the local file.
    }
  }

  const local = readLocalFile();
  if (local) return local;
  const seeded = buildSeed();
  writeLocalFile(seeded);
  return seeded;
}

async function saveDB(db) {
  const store = await getBlobStore();

  if (store) {
    try {
      await store.setJSON(DB_KEY, db);
      return;
    } catch (err) {
      // fall through to local file
    }
  }

  writeLocalFile(db);
}

// Reads the DB, lets the caller mutate it in place (or return a replacement
// object), then persists the result. This is not a real transaction, but is
// sufficient for a single-writer demo app.
async function mutateDB(mutator) {
  const db = await getDB();
  const result = await mutator(db);
  const next = result === undefined ? db : result;
  await saveDB(next);
  return next;
}

module.exports = { getDB, saveDB, mutateDB };
