/**
 * Minimal flow-registry validator (blueprint section 9). Grows over time —
 * this is intentionally small for a day-1 skeleton, not the final version.
 *
 * Works with a single-app repo (flows.json at the repo root, as this
 * scaffold ships) and a multi-app repo (apps/<app>/flows.json), so this
 * script doesn't need to change when a second app is added.
 */
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

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

const rootFlows = join(repoRoot, 'flows.json');
if (existsSync(rootFlows)) flowsFiles.push(rootFlows);

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
  const parsed = JSON.parse(readFileSync(flowsPath, 'utf-8')) as {
    app: string;
    flows: Flow[];
  };

  for (const flow of parsed.flows) {
    if (seenIds.has(flow.id)) {
      console.error(`Duplicate flow id: ${flow.id}`);
      hasError = true;
    }
    seenIds.add(flow.id);

    if (!flow.owner) {
      console.error(`Flow ${flow.id} has no owner`);
      hasError = true;
    }
    if (!flow.tag.startsWith('@flow:')) {
      console.error(`Flow ${flow.id} tag must start with @flow:`);
      hasError = true;
    }
  }
}

if (hasError) {
  console.error('Flow registry validation failed.');
  process.exit(1);
} else {
  console.log(`Flow registry OK (${seenIds.size} flow(s) validated).`);
}
