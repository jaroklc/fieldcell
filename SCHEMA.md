# FieldCell 0.6 cell contract

This branch proposes a 0.6 authoring contract for cells. It is aimed at implementations that need to validate a document, preserve every dimension, and pack a repeated observation into one cell. The frozen 0.5.2 files in `historical/v0.5.2/` are the previous repository schema and context, plus a straight-quote transcription of the dissertation’s Appendix C instance.

The publication form is JSON that uses the terms in `context.jsonld`. JSON Schema checks the document shape. `scripts/check-cell.mjs` checks series alignment. JSON-LD expansion checks identity and the predicates outside the coordinate map. Passing one layer does not pass the others.

## Document shape

A published document is either one cell, a cell group with member `cells`, or a flattened `@graph` of cells. Nested members omit `@context`. The root cites `https://use.fieldcell.org/context.jsonld`.

| Field | Role |
|---|---|
| `id` | Global identity. Compacts from `@id`. |
| `type` | `Cell`, `CellGroup`, or a profile type. Role is not stored here. |
| `coordinates` | Open map from a dimension name to a position. |
| `value` | Payload. Omitted on identity cells such as a criterion, an alternative, or a group root. |
| `seriesAxis` | Name of the one coordinate whose value is an ordered array. Optional when that coordinate is the only array in the map. |
| `author`, `dateCreated`, `citation` | Provenance of this fragment. |
| `validFrom`, `validThrough` | Interval when the record is in effect. |
| `isPartOf` | Membership or nesting. Several parents are an array. |
| `label`, `description`, `comment`, `image` | Human-readable and mixed-form content. |
| `cells` | Ordered publication list. Order is not a score. |

`dateCreated` is when the cell was written. `validFrom` / `validThrough` bound the record. `timeClaimedTrue` is the time the statement is about, and it belongs in `coordinates` so it can be stepped along like any other dimension.

## Coordinates

Each coordinate value is one of:

- a literal (`string`, `number`, or `boolean`)
- a reference, `{ "@id": "https://..." }` inside the coordinate map, or `{ "id": "https://..." }` where compaction has aliased it
- an array of those, used only for the series axis

Keys are matched literally. `timeClaimedTrue` and `fc:timeClaimedTrue` are different keys. Prefer a context term (`criterion`, `alternative`, `role`, `timeClaimedTrue`) or an absolute IRI. Unknown keys stay in the document.

Recommended `role` literals are `group`, `criterion`, `alternative`, `weight`, `matrixCell`, `label`, and `entity`. Profiles may add roles. The historical Appendix C literal `fc:matrixCell` migrates to `matrixCell`.

## Series: one varying dimension

Use a series when the same fragment repeats along one dimension, as with GDP for one country across years.

```json
{
  "@context": "https://use.fieldcell.org/context.jsonld",
  "id": "https://example.org/cells/usa-gdp-illustration",
  "type": "Cell",
  "coordinates": {
    "country": { "@id": "https://example.org/countries/USA" },
    "indicator": { "@id": "https://example.org/indicators/gross-domestic-product" },
    "timeClaimedTrue": ["2019", "2020", "2021"]
  },
  "seriesAxis": "timeClaimedTrue",
  "value": [21439400, 21354100, 23594000]
}
```

Index `i` of the axis array pairs with index `i` of the measurement array. The measurement array is `value` when `value` is an array, or `value.value` when `value` is a `PropertyValue`. `seriesAxis` may be omitted when exactly one coordinate is an array; published documents should include it.

`PropertyValue` carries the shared unit and scale:

```json
"value": {
  "@type": "PropertyValue",
  "unitText": "current USD",
  "value": [21439400, 21354100, null]
}
```

Rules:

- At most one coordinate is an array. A second varying dimension is another cell. A country-year panel is a set of series, one per country, as in `examples/gdp-panel.json`.
- Array order is the observation order. Readers do not sort it. Property order inside `coordinates` and `PropertyValue` is not significant; an RDF round trip may reorder those keys and still keep every field, array, and `null`.
- `null` in the measurement array keeps the index and is a missing observation. It is not zero.
- JSON strings and JSON numbers stay as written. `"5"` and `5` are different tokens.
- `unitText`, `minValue`, and `maxValue` apply to every index. A different unit is a different cell.
- A series does not merge cells that differ in any other coordinate, in `author`, or in `citation`.

Point cells remain the fine-grained form. A series expands to a view, one view per index, without writing new stored cells:

- view id: `{cell id}#series={index}` with a zero-based index
- `seriesAxis` removed
- that coordinate set to the single key at `index`
- the measurement set to the single token at `index`
- every other coordinate and provenance field copied

Duplicate axis keys are allowed. The index is the address when a key repeats.

## Nexting

Nexting is stepping to the next observation along a chosen dimension while holding the other coordinates constant.

- Along the series axis, the next observation is the next index in that cell.
- Along any other coordinate, the next observation is another cell whose remaining coordinates match and whose chosen coordinate differs.
- Author is a provenance field in the examples, so two scores that share criterion and alternative and differ in `author` are two cells. A view that groups only on criterion and alternative keeps both. Putting `author` into `coordinates` makes authorship an axis inside the same map.
- The document has no stored `next` link, so no dimension is privileged.
- Ranking, weights summing to one, missing-as-zero, and TOPSIS are analysis choices. They are not the meaning of a cell.

`isPartOf` builds nesting in a flat list. In `examples/decision-group.json`, Communication is part of the hiring group and part of the Interpersonal criterion. The parent’s `role` says which kind of parent it is. The set of parents is the relationship. Parent order is not a ranking, and an RDF round trip may reorder it. Publication order of `cells` is a list and does survive that round trip.

## JSON-LD

`context.jsonld` sets `@version` to 1.1. `coordinates` and `value` are `rdf:JSON` blobs (`@type: @json`). That is deliberate:

- An `@index` map keeps dimension names in memory, and a plain JSON array often compacts back in the same order.
- Converting that map to RDF drops `@index`. The dimension names collapse, and series order is no longer guaranteed.
- An explicit `@list` cannot be combined with `@index` in JSON-LD 1.1.
- The JSON blob keeps dimension keys, array order, `null`, and `{ "@id": "..." }` references through an RDF round trip.

Consequences for implementers:

- Read `coordinates` and `value` as JSON. Do not expect dimension keys to appear as expanded predicates.
- A `{ "@id": "..." }` inside `coordinates` is a FieldCell reference. Generic RDF tools will not follow it until a later profile projects the blob into triples.
- `id`, `type`, `author`, `isPartOf`, `cells`, and `seriesAxis` are real JSON-LD terms and do expand.
- `value` expands to `https://use.fieldcell.org/value`. In 0.5.2 the same key expanded to `http://schema.org/PropertyValue`.
- The `@type` string `PropertyValue` inside the value blob is the schema.org class token. The context does not expand strings inside the blob.
- Schema.org prefixes in this context use `http://schema.org/`. `https://schema.org/Rating` in Appendix C is a different string.
- After an RDF round trip, a group’s `cells` list may contain references while the cell bodies sit in `@graph`. Both embeddings and references are valid list items.

Structural validation does not dereference `@id`s. Traversal needs its own depth and size limits. Duplicate ids in one document are a conflict. Cycles and partial `cells` lists are allowed; a missing target is not a schema error.

## Validation

```bash
node scripts/check-cell.mjs examples/gdp-series.json examples/gdp-panel.json examples/decision-group.json
```

| Check | Layer |
|---|---|
| Required `id` and `coordinates`, optional `value`, literal or `PropertyValue` payloads | `cell.schema.json` |
| `seriesAxis` accompanied by an array measurement | `cell.schema.json` |
| One array coordinate, zipped lengths, inferred axis | `scripts/check-cell.mjs` |
| Context URL, expanded `id`, survival of a series through RDF | JSON-LD processor |

`examples/invalid/two-series-axes.json` and `examples/invalid/length-mismatch.json` satisfy the schema and fail the checker. `examples/invalid/series-axis-with-scalar-value.json` fails the schema. `historical/v0.5.2/appendix-c.cell.json` is evidence of the 2024 instance. It fails both the 0.5.2 schema and this schema; it is not a document to “fix” into conformance.

`format` assertions such as `uri` depend on a format-aware validator.

The examples were checked with Ajv in strict draft 2020-12 mode and with jsonld.js. The three authoring documents validate, series arrays and `null` survive an RDF round trip, and Appendix C fails both the 0.5.2 schema and this one.

## What changed from 0.5.2

| Topic | 0.5.2 repository | 0.6 proposal |
|---|---|---|
| Identity | Required `fc:id`, which does not expand to `@id` | Required `id`, which expands to `@id` |
| Coordinates | Each value had to be an object requiring `fc:isPartOf`, `fc:author`, and `fc:dateCreated` | Each value is a literal, a reference, or one series array |
| Appendix C | String coordinate values, so the instance does not validate against the printed schema | Preserved unchanged under `historical/v0.5.2/` |
| Identity cells | `fc:value` required | `value` omitted when the cell only establishes an entity |
| Payload | `value` string inside `PropertyValue`, property key `fc:propertyID` | String, number, boolean, `null`, or an array of those; qualified form uses `propertyID`, `unitText`, `minValue`, and `maxValue` |
| `value` predicate | Context maps `value` to `schema:PropertyValue` with `@json` | Context maps `value` to `fc:value` with `@json` |
| Coordinate JSON-LD | `@container: @index` | `@type: @json`, so keys and series order survive RDF |
| Series | None | One packed axis, parallel measurement array |
| Context version | JSON-LD 1.0 processing, while `@json` is a 1.1 feature | `@version: 1.1` |
| Schema id | `https://use.fieldcell.org/cell.schema.json` | `https://use.fieldcell.org/v0.6/cell.schema.json` |

The unversioned context URL in this repository is the proposed 0.6 context. Serve `historical/v0.5.2/context.jsonld` for existing 0.5.2 documents, and publish the 0.6 context at the versioned schema’s companion URL before replacing a live unversioned context. A context change alters the meaning of documents whose JSON did not change.

## Left for a later profile

Authentication, access control, synchronization, and remote-context caching are outside this schema. So are two-dimensional value grids, per-index stored ids, a closed role enum, equating `http` and `https` schema.org IRIs, and any rule that turns a missing measurement into zero.
