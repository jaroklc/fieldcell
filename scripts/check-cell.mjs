#!/usr/bin/env node
// Series alignment beyond JSON Schema: at most one array coordinate,
// zipped with the measurement array. Usage: node scripts/check-cell.mjs <file...>

import { readFileSync } from "node:fs";

export function checkDocument(doc, label = "document") {
  const errors = [];
  for (const cell of collectCells(doc)) {
    errors.push(...checkCell(cell).map((message) => `${label} ${cell.id}: ${message}`));
  }
  return errors;
}

function collectCells(node, out = []) {
  if (!node || typeof node !== "object") return out;
  if (Array.isArray(node)) {
    for (const item of node) collectCells(item, out);
    return out;
  }
  if (typeof node.id === "string" && node.coordinates && typeof node.coordinates === "object") {
    out.push(node);
  }
  if (Array.isArray(node.cells)) collectCells(node.cells, out);
  if (Array.isArray(node["@graph"])) collectCells(node["@graph"], out);
  return out;
}

function checkCell(cell) {
  const errors = [];
  const coordinates = cell.coordinates;
  if (!coordinates || typeof coordinates !== "object" || Array.isArray(coordinates)) {
    return ["coordinates must be an object"];
  }

  const arrayKeys = Object.keys(coordinates).filter((key) => Array.isArray(coordinates[key]));
  const measured = measurementArray(cell.value);

  if (arrayKeys.length > 1) {
    errors.push(
      `only one coordinate may be an array so the other dimensions stay available for nexting; found ${arrayKeys.join(", ")}`
    );
  } else if (arrayKeys.length === 1) {
    const inferred = arrayKeys[0];
    const axis = cell.seriesAxis ?? inferred;
    if (cell.seriesAxis !== undefined && cell.seriesAxis !== inferred) {
      errors.push(`seriesAxis "${cell.seriesAxis}" must name the array coordinate "${inferred}"`);
    }
    if (!measured) {
      errors.push(`coordinate "${axis}" is an array, so value must be a parallel array`);
    } else if (measured.length !== coordinates[inferred].length) {
      errors.push(
        `value length ${measured.length} must equal ${inferred} length ${coordinates[inferred].length}`
      );
    }
  } else if (cell.seriesAxis !== undefined) {
    errors.push(`seriesAxis "${cell.seriesAxis}" must name a coordinate whose value is an array`);
  } else if (measured) {
    errors.push("an array value needs exactly one array coordinate to zip against");
  }

  return errors;
}

function measurementArray(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object" && Array.isArray(value.value)) return value.value;
  return null;
}

if (process.argv[1]?.endsWith("check-cell.mjs")) {
  const files = process.argv.slice(2);
  if (files.length === 0) {
    console.error("usage: node scripts/check-cell.mjs <file...>");
    process.exit(2);
  }
  let failed = false;
  for (const file of files) {
    const doc = JSON.parse(readFileSync(file, "utf8"));
    const errors = checkDocument(doc, file);
    if (errors.length === 0) {
      console.log(`ok ${file}`);
    } else {
      failed = true;
      for (const error of errors) console.error(error);
    }
  }
  process.exit(failed ? 1 : 0);
}
