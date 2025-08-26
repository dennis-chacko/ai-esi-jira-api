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
- Refactor config.ts to use key-value objects for configuration management with proper OOP encapsulation:
    - Rename `esiOAuthSecretName` to `secretNames` and convert it to a private object with properties for each secret
    - Convert `parameterStoreKeys` to a private object with properties for each parameter store key
    - Provide controlled access through getter methods to maintain encapsulation

#### Required AWS Secrets Manager keys:
- ESI_OAUTH_SECRET_NAME

#### Required AWS Parameter Store keys:
- SAMS_HOST_PARAM
- PRODUCER_INTERFACE_KEY

#### Implementation Pattern:

**Step 1**: Define module-level constants at the top of the file (outside the class) for each secret and parameter listed above. **Export them** so they can be imported by other files.

**Step 2**: Create private readonly key-value objects in the class and initialize them in the constructor using the constants as keys.

**Step 3**: Add public getter methods to provide controlled access to configuration values.

**Step 4**: Remove individual properties and replace all internal usages with getter methods.

**Step 5**: Update all files that reference the old properties to import the constants and use the getter methods.

#### Reference Implementation:
```typescript
// Step 1: Define and export constants
export const SECRET_NAME = 'SECRET_NAME';
export const PARAM_KEY = 'PARAM_KEY';

export class Config {
  // Step 2: Private readonly objects for encapsulation
  private readonly secretNames: { [key: string]: string };
  private readonly parameterStoreKeys: { [key: string]: string };

  constructor() {
    // Initialize private configuration objects
    this.secretNames = {
      [SECRET_NAME]: this._getEnv(SECRET_NAME, 'default/secret/path')
    };
    
    this.parameterStoreKeys = {
      [PARAM_KEY]: this._getEnv(PARAM_KEY, '/default/param/path')
    };
  }

  // Step 3: Getter methods for controlled access
  public getSecretName(key: string): string {
    return this.secretNames[key];
  }
  
  public getParameterStoreKey(key: string): string {
    return this.parameterStoreKeys[key];
  }

  // Step 4: Use getter methods internally
  private async loadConfig() {
    const secret = this.getSecretName(SECRET_NAME);
    const param = this.getParameterStoreKey(PARAM_KEY);
  }
}

// Step 5: In other files, import constants and use getter methods
import { Config, SECRET_NAME, PARAM_KEY } from './config';

someMethod(config: Config) {
  const secret = config.getSecretName(SECRET_NAME);
  const param = config.getParameterStoreKey(PARAM_KEY);
}
```
