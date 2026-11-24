#!/usr/bin/env node
/**
 * make.fun bounty entry runner — bring-the-humans-03
 *
 * Copies VIDEO.json from the bot directory to the output directory.
 * Node 22 standard library only. Deterministic, no network access.
 *
 *   MAKEFUN_BOT_DIR     source directory holding VIDEO.json  (default: /bot)
 *   MAKEFUN_OUTPUT_DIR  destination directory                 (default: /output)
 *
 * Exit 0 on success, exit 1 with a clear message on any failure.
 */

import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const FILE = "VIDEO.json";

function fail(message: string): never {
  process.stderr.write(`error: ${message}\n`);
  process.exit(1);
}

function main(): void {
  const botDir = resolve(process.env.MAKEFUN_BOT_DIR ?? "/bot");
  const outDir = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? "/output");
  const src = join(botDir, FILE);
  const dest = join(outDir, FILE);

  if (!existsSync(botDir)) {
    fail(`bot directory does not exist: ${botDir} (set MAKEFUN_BOT_DIR)`);
  }
  if (!existsSync(src) || !statSync(src).isFile()) {
    fail(`source file not found: ${src}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(src, "utf8"));
  } catch (err) {
    fail(`${src} is not valid JSON: ${(err as Error).message}`);
  }

  const url = (parsed as { url?: unknown } | null)?.url;
  if (typeof url !== "string" || !url.startsWith("https://")) {
    fail(`${src} must contain a "url" string starting with https://`);
  }

  try {
    mkdirSync(outDir, { recursive: true });
  } catch (err) {
    fail(`could not create output directory ${outDir}: ${(err as Error).message}`);
  }

  try {
    copyFileSync(src, dest);
  } catch (err) {
    fail(`could not copy ${src} to ${dest}: ${(err as Error).message}`);
  }

  if (!existsSync(dest)) {
    fail(`copy reported success but ${dest} is missing`);
  }

  process.stdout.write(`copied ${src} -> ${dest}\n`);
}

main();
