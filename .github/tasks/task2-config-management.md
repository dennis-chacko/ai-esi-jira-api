# Task 2: Configuration Management

## Objective
Refactor config.ts to use key-value objects for configuration management with proper OOP encapsulation.

## Requirements
- Do not make any changes if the below instructions for config.ts are already followed
- Refactor config.ts to use key-value objects for configuration management with proper OOP encapsulation:
    - Rename `esiOAuthSecretName` to `secretNames` and convert it to a private object with properties for each secret
    - Convert `parameterStoreKeys` to a private object with properties for each parameter store key
    - Provide controlled access through getter methods to maintain encapsulation

## Required AWS Secrets Manager keys:
- ESI_OAUTH_SECRET_NAME

## Required AWS Parameter Store keys:
- SAMS_HOST_PARAM
- PRODUCER_INTERFACE_KEY

## Implementation Pattern:

**Step 1**: Define module-level constants at the top of the file (outside the class) for each secret and parameter listed above. **Export them** so they can be imported by other files.

**Step 2**: Create private readonly key-value objects in the class and initialize them in the constructor using the constants as keys.

**Step 3**: Add public getter methods to provide controlled access to configuration values.

**Step 4**: Remove individual properties and replace all internal usages with getter methods.

**Step 5**: Update all files that reference the old properties to import the constants and use the getter methods.

## Reference Implementation:
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
