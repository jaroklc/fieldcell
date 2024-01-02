# FieldCell Context Repository

## Introduction
Welcome to the FieldCell Context Repository. This repository contains the JSON-LD context for the FieldCell model, a flexible framework designed for structuring and representing decision information in digital formats. The FieldCell model extends the Schema.org vocabulary, ensuring broad compatibility and usability in various decision-making contexts.

## Overview
The FieldCell model is part of an initiative to enable global publication and reusability of decision fragments, leveraging the power of linked data and semantic web technologies. It is designed to cater to a wide range of applications, from simple decision matrices to complex decision-making structures.

## Contents
- `context.jsonld`: The JSON-LD context file that defines the structure and properties of the FieldCell model.
- (TO DO) documentation and usage examples will be added to this repository as well as the home site of the project - https://use.fieldcell.org

## Key Features
- **Temporal Properties**: `validFrom`, `validThrough`, and `timeClaimedTrue` for specifying the validity and relevance period of information.
- **Relational Properties**: `isPartOf` for establishing hierarchical relationships and `citation` for referencing information sources.
- **Coordinates**: Used to define a collection of properties or attributes of a cell. Each coordinate can represent dimensions like time, location, or specific characteristics relevant to the cell's context.
- **Value Field**: A versatile property that can hold various types of data, such as textual descriptions, numeric values, or complex objects, providing flexibility in representing the content of a cell.
- **Weight Entity**: Customizable entity used to assign weights to criteria or participants in decision-making processes, allowing for nuanced representation of influence or priority.

## Contributing
Contributions to the FieldCell Context Repository are welcome! 
## Feedback and Support
For feedback, questions, or support, please create an issue in this repository or contact the maintainers.

## License
This project is licensed under the [MIT License](LICENSE) - see the LICENSE file for details.
