import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

export function nowIso(): string {
  return new Date().toISOString();
}

export function createRunId(prefix = "run"): string {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `${prefix}-${stamp}`;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function ensureDir(path: string): Promise<void> {
  await mkdir(path, { recursive: true });
}

export async function readJsonFile<T>(path: string): Promise<T> {
  const raw = await readFile(resolve(process.cwd(), path), "utf8");
  const trimmed = raw.trim();

  if (trimmed.length === 0) {
    throw new Error(`JSON file "${path}" is empty.`);
  }

  try {
    return JSON.parse(trimmed) as T;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Invalid JSON in "${path}": ${message}`);
  }
}

export async function readTextFile(path: string): Promise<string> {
  return readFile(resolve(process.cwd(), path), "utf8");
}

export async function writeJsonFile(path: string, data: unknown): Promise<void> {
  const absolutePath = resolve(process.cwd(), path);
  await mkdir(dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2));
}
