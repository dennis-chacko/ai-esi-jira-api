# Co-pilot Instructions for ESI Lambda Producer code generation
This is an AWS Lambda Producer function that accepts a payload in the Lambda event, validates it, and then transforms it to a canonical ESI document. This transformed document is then sent to SAMS for publishing to downstream consumers.

## Language and platform:
- Node.js
- TypeScript
- AWS Lambda
- Note: Express.js is not used in this Lambda.

## Key dependencies
- aws-sdk/client-dynamodb
- types/xml-js
- esi-integrations-library
- fast-xml-parser
- lodash

## Test dependencies
- jest
- @types/jest
- ts-jest

## Files and Directories
```
├── src/
│   ├── mappers/       // Mapper classes
│   ├── models/        // Model classes
│   ├── sams_common/   // Common classes to interface with SAMS. Do not modify.
│   ├── config/        // Configuration related classes (if present)
│   ├── services/      // Service classes for business logic (if present)
```

## Coding standards and conventions

### TypeScript conventions:
- Use PascalCase for type names (interfaces, types).
- Use camelCase for function names, variables, and parameters.
- Use const for variables that are not reassigned.
- Use JSDoc comments for complex functions and interfaces.
- Add JSDoc comments to all methods and class definitions for better code documentation.

### Error handling:
- Always validate input data and handle potential errors gracefully.
- Use try-catch blocks around asynchronous operations.
- Log errors with sufficient context for debugging.
- Return meaningful error messages to the caller.

### Logging
- Use ESILogger to log messages consistently across the application.
- Log at appropriate levels (e.g., INFO, WARN, ERROR) based on the significance of the event.
- Use the below sample code snippet for logging:    

```typescript
import { ESILogger } from 'esi-integrations-library';

const logger = ESILogger.getLogger('YourServiceName');

logger.info('Informational message');
logger.warn('Warning message');
logger.error('Error message', { error: new Error('Sample error') });
```

### AI behavior and constraints
- Prioritize existing code: When suggesting new code or refactoring, analyze the existing codebase first to align with the established patterns and conventions.
- Do not generate boilerplate: Avoid generating large, generic code blocks. Focus on providing specific, context-aware suggestions.
- Explain reasoning: When making a significant suggestion (e.g., changing an architectural pattern), provide a brief explanation of why.
- Add a header comment to each new or modified file, describing its purpose and any important details. Also indicate if the code was AI-generated.
- Use src as the root of all source files

### Patterns
- Use the Builder pattern to create instances of classes and inject their dependencies, promoting immutability and easier testing.
- Follow the Single Responsibility Principle: each class or module should have one, and only one, reason to change.
- Use Dependency Injection to manage dependencies between classes, making the code more modular and testable.
- Store configuration settings in a centralized location and inject them where needed.

## Code Generation Tasks and workflows

For detailed implementation instructions, refer to the following task files:

### Task 1: Housekeeping Tasks
See [Task 1: Housekeeping Tasks](tasks/task1-housekeeping.md) for detailed instructions on organizing project files into proper directory structure.

### Task 2: Configuration Management
See [Task 2: Configuration Management](tasks/task2-config-management.md) for detailed instructions on refactoring config.ts with proper OOP encapsulation.

### Task 3: Mapping Rules Implementation
See [Task 3: Mapping Rules Implementation](tasks/task3-mapping_rules.md) for detailed instructions on implementing comprehensive mapping logic between JSM tickets and ITSM tickets, including event transformation and validation rules.

### Final Task: Documentation Enhancement
See [Final Task: Documentation Enhancement](tasks/finalTask-documentation.md) for detailed instructions on creating comprehensive documentation for local development, testing, and API Gateway usage with complete cURL and Postman examples. **This task should be completed last, after all other implementation tasks are finished.**
