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
├── src/
│   ├── mappers/       // Mapper classes
│   ├── models/        // Model classes
│   ├── sams_common/   // Common classes to interface with SAMS. Do not modify.
│   ├── config/        // Configuration related classes (if present)
│   ├── services/      // Service classes for business logic (if present)

## Coding standards and conventions

### TypeScript conventions:
- Use PascalCase for type names (interfaces, types).
- Use camelCase for function names, variables, and parameters.
- Use const for variables that are not reassigned.
- Use JSDoc comments for complex functions and interfaces. 

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

### Patterns
- Use the Builder pattern to create instances of classes and inject their dependencies, promoting immutability and easier testing.
- Follow the Single Responsibility Principle: each class or module should have one, and only one, reason to change.
- Use Dependency Injection to manage dependencies between classes, making the code more modular and testable.
- Store configuration settings in a centralized location and inject them where needed.

## Code Generation Tasks and workflows

### Task 1: Housekeeping Tasks
- Move config.ts to the config/ directory
- Move health check related files to the services/ directory
- Move ItsmTicketFilter.ts to the services/filters directory

### Task 2: Use config.ts for configuration management
- Do not make any changes if the below instructions for config.ts are already followed
- Refactor config.ts to use key-value objects for configuration management:
    - Rename `esiOAuthSecretName` to `secretNames` and convert it to an object with properties for each secret
    - Convert `parameterStoreKeys` to an object with properties for each parameter store key

#### Required AWS Secrets Manager keys:
- ESI_OAUTH_SECRET_NAME

#### Required AWS Parameter Store keys:
- SAMS_HOST_PARAM
- PRODUCER_INTERFACE_KEY

#### Implementation Pattern:

**Step 1**: Define module-level constants at the top of the file (outside the class) for each secret and parameter listed above. **Export them** so they can be imported by other files.

**Step 2**: Create key-value objects in constructor using the constants as keys, and initialize each with appropriate environment variable calls and default values.

**Step 3**: Remove individual properties and replace all usages with direct object access using the constants.

**Step 4**: Update all files that reference the old properties to import the constants and use the new object-based access pattern.

#### Reference Implementation:
```typescript
// Step 1: Define and export constants
export const SECRET_NAME = 'SECRET_NAME';
export const PARAM_KEY = 'PARAM_KEY';

export class Config {
  public secretNames: { [key: string]: string };
  public parameterStoreKeys: { [key: string]: string };

  constructor() {
    // Step 2: Create objects
    this.secretNames = {
      [SECRET_NAME]: this._getEnv(SECRET_NAME, 'default/secret/path')
    };
    
    this.parameterStoreKeys = {
      [PARAM_KEY]: this._getEnv(PARAM_KEY, '/default/param/path')
    };
  }
}

// Step 4: In other files, import constants and use new pattern
import { Config, SECRET_NAME, PARAM_KEY } from './config';

someMethod(config: Config) {
  const secret = config.secretNames[SECRET_NAME];
  const param = config.parameterStoreKeys[PARAM_KEY];
}
```