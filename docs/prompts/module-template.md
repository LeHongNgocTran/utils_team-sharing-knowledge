# Module Implementation Prompt Template

```text
Implement module: <MODULE_NAME>

Goal:
<SHORT_DESCRIPTION>

Input schema:
<INPUT_SCHEMA>

Output schema:
<OUTPUT_SCHEMA>

Requirements:
- implement the existing provider interface
- keep the mock provider working
- add a real provider or rule-based provider without changing orchestrator flow
- validate output with shared schemas
- add unit tests
- update the module README

Do not:
- add unrelated framework dependencies
- change shared schemas without documenting the contract change
- call real external APIs from tests

Definition of done:
- npm run build passes
- npm test passes
- mock workflow still runs
- provider can be selected through config
```
