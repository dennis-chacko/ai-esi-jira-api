# Task 2: Configuration Management

## Objective
Refactor config.ts to use key-value objects for configuration management with proper OOP encapsulation.

## Prerequisites
Before starting this task, complete the Configuration Planning section in [project-planning-template.md](../project-planning-template.md) to identify all required secrets and parameters for your application.

## Requirements
- Do not make any changes if the below instructions for config.ts are already followed
- Refactor config.ts to use key-value objects for configuration management with proper OOP encapsulation:
    - Rename `esiOAuthSecretName` to `secretNames` and convert it to a private object with properties for each secret
    - Convert `parameterStoreKeys` to a private object with properties for each parameter store key
    - Provide controlled access through getter methods to maintain encapsulation

## Implementation Pattern:

**Step 1**: Define module-level constants at the top of the file (outside the class) for each secret and parameter identified in your planning template. **Export them** so they can be imported by other files.

**Step 2**: Create private readonly key-value objects in the class and initialize them in the constructor using the constants as keys.

**Step 3**: Add public getter methods to provide controlled access to configuration values.

**Step 4**: Remove individual properties and replace all internal usages with getter methods.

**Step 5**: Update all files that reference the old properties to import the constants and use the getter methods.

## Reference Implementation:
```typescript
// Step 1: Define and export constants for YOUR specific keys
export const YOUR_SECRET_KEY = 'YOUR_SECRET_KEY';
export const YOUR_PARAM_KEY = 'YOUR_PARAM_KEY';

export class Config {
  // Step 2: Private readonly objects for encapsulation
  private readonly secretNames: { [key: string]: string };
  private readonly parameterStoreKeys: { [key: string]: string };

  constructor() {
    // Initialize private configuration objects
    this.secretNames = {
      [YOUR_SECRET_KEY]: this._getEnv(YOUR_SECRET_KEY, 'default/secret/path')
    };
    
    this.parameterStoreKeys = {
      [YOUR_PARAM_KEY]: this._getEnv(YOUR_PARAM_KEY, '/default/param/path')
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
    const secret = this.getSecretName(YOUR_SECRET_KEY);
    const param = this.getParameterStoreKey(YOUR_PARAM_KEY);
  }
}

// Step 5: In other files, import constants and use getter methods
import { Config, YOUR_SECRET_KEY, YOUR_PARAM_KEY } from './config';

someMethod(config: Config) {
  const secret = config.getSecretName(YOUR_SECRET_KEY);
  const param = config.getParameterStoreKey(YOUR_PARAM_KEY);
}
```
