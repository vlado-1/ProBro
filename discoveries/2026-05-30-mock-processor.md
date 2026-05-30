# MockProcessor selection behavior

Date: 2026-05-30

Context: Where and how the extension chooses to use the mock processor implementation.

Learning:
- The extension chooses `MockProcessor` when the setting `pro-bro.development.useMockProcessor` is true.
- The processor selection lives in `ProcessorFactory.determineProcessorType()`.
- If `useMockProcessor` is false, `pro-bro.development.useNewDbClient` controls whether the new `DbProcessor` (true) or legacy `DatabaseProcessor` (false) is used.

Evidence:
- [src/repo/processor/ProcessorFactory.ts](src/repo/processor/ProcessorFactory.ts) (determineProcessorType → getProcessorInstance)
- [src/common/Constants.ts](src/common/Constants.ts)
- Mock implementation: [src/repo/processor/mock/MockProcessor.ts](src/repo/processor/mock/MockProcessor.ts)

Actions:
- To enable mock behavior, set `pro-bro.development.useMockProcessor` to `true` in user or workspace `settings.json`.
- Consider documenting this in the README if mock mode is useful for local development.
