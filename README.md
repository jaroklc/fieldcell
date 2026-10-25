# FieldCell Context Repository

## Introduction
Welcome to the FieldCell Context Repository. This repository contains the JSON-LD context for the FieldCell model, a flexible framework designed for structuring and representing decision information in digital formats. The FieldCell model extends the Schema.org vocabulary, ensuring broad compatibility and usability in various decision-making contexts.

## Overview
The FieldCell model is part of an initiative to enable global publication and reusability of decision fragments, leveraging the power of linked data and semantic web technologies. It is designed to cater to a wide range of applications, from simple decision matrices to complex decision-making structures.

## Contents
- `context.jsonld`: Proposed FieldCell 0.6 JSON-LD context.
- `cell.schema.json`: Proposed FieldCell 0.6 JSON Schema for a cell or cell group.
- `SCHEMA.md`: Authoring contract, series alignment, nexting, and the migration from 0.5.2.
- `examples/`: A GDP series, a two-country panel, a decision group, and invalid series documents.
- `historical/v0.5.2/`: The previous schema and context, and a transcription of the dissertation’s Appendix C cell.
- (TO DO) the project site https://use.fieldcell.org will publish the versioned context and schema.

## Key Features
- **Temporal Properties**: `dateCreated` for when a cell was written, `validFrom` and `validThrough` for when the record is in effect, and `timeClaimedTrue` as a coordinate for the time a statement is about.
- **Relational Properties**: `isPartOf` for membership and nesting, including more than one parent, and `citation` for sources.
- **Coordinates**: An open map of dimensions. A value is a literal, a reference to another cell, or an array on a single series axis.
- **Series**: When every coordinate is shared except one, that coordinate holds an ordered array and the cell value holds the matching array. See the GDP example in `examples/gdp-series.json`.
- **Value Field**: Optional, so identity cells can omit it. A present value is a literal, an array of literals, or a `PropertyValue` with unit and scale. `null` in a series is a missing observation.
- **Weight Entity**: A cell whose role is `weight`, attached to a criterion, rather than a single number baked into the criterion.

## Contributing
Contributions to the FieldCell Context Repository are welcome! 
## Feedback and Support
For feedback, questions, or support, please create an issue in this repository or contact the maintainers.

## License
This project is licensed under the [MIT License](LICENSE) - see the LICENSE file for details.
