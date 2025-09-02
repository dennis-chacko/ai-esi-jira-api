# Task 2: Configuration Management and Builder Pattern

## Objective
Refactor config.ts to use key-value objects for configuration management with proper OOP encapsulation, and implement a Builder pattern for creating application components with dependency injection.

## Prerequisites
Before starting this task, complete the Configuration Planning section in [project-planning-template.md](../project-planning-template.md) to identify all required secrets and parameters for your application.

## Requirements

### Configuration Refactoring
- Do not make any changes if the below instructions for config.ts are already followed
- Refactor config.ts to use key-value objects for configuration management with proper OOP encapsulation:
    - Rename `esiOAuthSecretName` to `secretNames` and convert it to a private object with properties for each secret
    - Convert `parameterStoreKeys` to a private object with properties for each parameter store key
    - Provide controlled access through getter methods to maintain encapsulation

### Builder Pattern Implementation
- Create or update `src/config/Builder.ts` file that implements the Builder pattern for dependency injection
- Implement the methods defined in the Builder Pattern Configuration section of [project-planning-template.md](../project-planning-template.md)
- Add convenience methods for creating complete component sets
- Include proper error handling, logging, and configuration validation

## Implementation Pattern:

### Configuration Refactoring Steps:

**Step 1**: Define module-level constants at the top of the file (outside the class) for each secret and parameter identified in your planning template. **Export them** so they can be imported by other files.

**Step 2**: Create private readonly key-value objects in the class and initialize them in the constructor using the constants as keys.

**Step 3**: Add public getter methods to provide controlled access to configuration values.

**Step 4**: Remove individual properties and replace all internal usages with getter methods.

**Step 5**: Update all files that reference the old properties to import the constants and use the getter methods.

### Builder Pattern Implementation Steps:

**Step 1**: Create or update `src/config/Builder.ts` file with proper imports for all required components and interfaces. If the file already exists, update it with the required methods.

**Step 2**: Implement the Builder class with constructor that accepts a Config instance.

**Step 3**: Implement the methods defined in the Builder Pattern Configuration section of [project-planning-template.md](../project-planning-template.md) with proper dependency injection

**Step 4**: Add helper methods for validation and convenience:
- `validateConfiguration()` - Validates all required configuration is available
- `createComponents()` - Creates all components in one call, returns object with all instances
- `static createInstance(throwError?)` - Static factory method for creating Builder with loaded configuration

**Step 5**: Include comprehensive error handling, logging, and TypeScript type safety throughout.

## Reference Implementation:

### Configuration Refactoring Example:
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

### Builder Pattern Example:
```typescript
import { Config } from "../config";
import { ESILogger } from "esi-common-layer";

export class Builder {
    private readonly logger: any;
    private config: Config;

    constructor(config: Config) {
        this.config = config;
        this.logger = ESILogger.getLogger('Builder', config.logLevel);
    }

    // Core methods
    public createMapper(): SourceToTargetMapperClass {
        // Implementation with error handling and logging
        // Class name defined in project-planning-template.md
    }

    public createTrackingService(): TrackingService {
        // Implementation with configuration validation
    }

    public async createProducerInterface(mapper?: IMapper): Promise<SamsProducerInterface> {
        // Implementation with dependency injection
    }

    // Helper methods
    public validateConfiguration(): void {
        // Validate required configuration fields
    }

    public async createComponents(): Promise<ComponentSet> {
        // Create all components at once
    }

    public static async createInstance(throwError: boolean = true): Promise<Builder> {
        // Factory method for Builder creation
    }
}
```
