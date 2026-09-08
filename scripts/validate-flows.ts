/**
 * Minimal flow-registry validator (blueprint section 9). Grows over time —
 * this is intentionally small for a day-1 skeleton, not the final version.
 *
 * Works with a single-app repo (flows.json at the repo root, as this
 * scaffold ships) and a multi-app repo (apps/<app>/flows.json), so this
 * script doesn't need to change when a second app is added.
 */
// This is what `npm run validate:flows` runs, and it's the third step in
// .github/workflows/pr-validation.yml — deterministic enforcement of the
// flow registry, no AI involved at all (blueprint section 46).
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

// Mirrors the shape of one entry in flows.json — see that file's
// "_fieldNotes" for what each field means.
type Flow = {
  id: string;
  name: string;
  tag: string;
  owner: string;
  status: string;
  criticality: string;
  entryPoint: string;
  coveragePolicy: string[];
};

const repoRoot = join(__dirname, '..');
const flowsFiles: string[] = [];

// Single-app layout (this scaffold, today): flows.json lives at the repo
// root.
const rootFlows = join(repoRoot, 'flows.json');
if (existsSync(rootFlows)) flowsFiles.push(rootFlows);

// Multi-app layout (blueprint section 7's growth path): each app under
// apps/<name>/ has its own flows.json. This loop means this script never
// has to change when a second app is added — it just discovers more files.
const appsDir = join(repoRoot, 'apps');
if (existsSync(appsDir)) {
  for (const app of readdirSync(appsDir)) {
    const flowsPath = join(appsDir, app, 'flows.json');
    if (existsSync(flowsPath)) flowsFiles.push(flowsPath);
  }
}

const seenIds = new Set<string>();
let hasError = false;

for (const flowsPath of flowsFiles) {
  // Plain JSON.parse — this is why flows.json itself can't contain //
  // comments (its notes live in a separate "_readme"/"_fieldNotes" field
  // instead, which this parser simply ignores since it only reads
  // `.app`/`.flows`).
  const parsed = JSON.parse(readFileSync(flowsPath, 'utf-8')) as {
    app: string;
    flows: Flow[];
  };

  for (const flow of parsed.flows) {
    // Check 1: no two flows anywhere in the registry can share an id —
    // duplicate ids would make @flow: tags ambiguous.
    if (seenIds.has(flow.id)) {
      console.error(`Duplicate flow id: ${flow.id}`);
      hasError = true;
    }
    seenIds.add(flow.id);

    // Check 2: every flow needs an accountable owner — an unowned flow is
    // the thing that quietly rots (blueprint section 48's concern about
    // quarantine becoming a graveyard applies here too).
    if (!flow.owner) {
      console.error(`Flow ${flow.id} has no owner`);
      hasError = true;
    }
    // Check 3: tag format must match the @flow: convention tests are
    // expected to use (blueprint section 10) — this doesn't verify a test
    // actually uses this tag, just that the registry entry is well-formed.
    if (!flow.tag.startsWith('@flow:')) {
      console.error(`Flow ${flow.id} tag must start with @flow:`);
      hasError = true;
    }
  }
}

// Exit code 1 is what makes this a real CI gate, not just a printout —
// pr-validation.yml's "Validate flow registry" step fails the whole
// workflow run if this script exits non-zero.
if (hasError) {
  console.error('Flow registry validation failed.');
  process.exit(1);
} else {
  console.log(`Flow registry OK (${seenIds.size} flow(s) validated).`);
}
