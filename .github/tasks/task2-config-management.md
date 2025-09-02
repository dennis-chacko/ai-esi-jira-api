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
- Create or update `src/Builder.ts` file that implements the Builder pattern for dependency injection
- Implement the methods defined in the Builder Pattern Configuration section of [project-planning-template.md](../project-planning-template.md)
- Add convenience methods for creating complete component sets
- Include proper error handling, logging, and configuration validation
- Update main handler/entry point file (index.ts, handler.ts, etc.) to use Builder pattern instead of direct instantiation

### Main Handler Integration
- Replace all direct instantiation (`new ClassName()`) with Builder pattern calls
- Clean up unused imports after implementing Builder pattern
- Ensure proper error handling and dependency injection throughout the application flow

## Implementation Pattern:

### Configuration Refactoring Steps:

**Step 1**: Define module-level constants at the top of the file (outside the class) for each secret and parameter identified in your planning template. **Export them** so they can be imported by other files.

**Step 2**: Create private readonly key-value objects in the class and initialize them in the constructor using the constants as keys.

**Step 3**: Add public getter methods to provide controlled access to configuration values.

**Step 4**: Remove individual properties and replace all internal usages with getter methods.

**Step 5**: Update all files that reference the old properties to import the constants and use the getter methods.

### Builder Pattern Implementation Steps:

**Step 1**: Create or update `src/Builder.ts` file with proper imports for all required components and interfaces. If the file already exists, update it with the required methods.

**Step 2**: Implement the Builder class with constructor that accepts a Config instance.

**Step 3**: Implement the methods defined in the Builder Pattern Configuration section of [project-planning-template.md](../project-planning-template.md) with proper dependency injection

**Step 4**: Add helper methods for validation and convenience:
- `validateConfiguration()` - Validates all required configuration is available
- `createComponents()` - Creates all components in one call, returns object with all instances
- `static createInstance(throwError?)` - Static factory method for creating Builder with loaded configuration

**Step 5**: Include comprehensive error handling, logging, and TypeScript type safety throughout.

**Step 6**: Update main handler/entry point file to integrate Builder pattern:
- Import Builder class
- Replace direct instantiation with Builder method calls
- Remove unused imports after Builder integration
- Maintain existing functionality while improving architecture

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
import { Config } from "./config";
import { ESILogger } from "esi-common-layer";

export class Builder {
    private readonly logger: any;
    private config: Config;

    constructor(config: Config) {
        this.config = config;
        this.logger = ESILogger.getLogger('Builder', config.logLevel);
    }

    // Core methods - implement based on your architecture pattern
    public createMapper(): SourceToTargetMapperClass {
        // Implementation with error handling and logging
        // Class name defined in project-planning-template.md
    }

    public createEventMapper?(): EventToSourceMapperClass {
        // For Producer/Consumer patterns that process events
        // Optional based on architecture pattern selection
    }

    public createTrackingService(): TrackingService {
        // Implementation with configuration validation
    }

    public async createProducerInterface?(mapper?: IMapper): Promise<SamsProducerInterface> {
        // For Producer patterns - publishes to SAMS
        // Implementation with dependency injection
    }

    public async createConsumerInterface?(): Promise<SamsConsumerInterface> {
        // For Consumer patterns - consumes from SAMS
        // Implementation with dependency injection
    }

    public async createTransformerInterface?(mapper?: IMapper): Promise<TransformerInterface> {
        // For Transformer patterns - processes and transforms data
        // Implementation with dependency injection
    }

    // Helper methods
    public validateConfiguration(): void {
        // Validate required configuration fields
    }

    public async createComponents(): Promise<ComponentSet> {
        // Create all components at once based on architecture pattern
    }

    public static async createInstance(throwError: boolean = true): Promise<Builder> {
        // Factory method for Builder creation
    }
}
```

### Main Handler Integration Pattern:

#### Before (Direct Instantiation):
```typescript
// Traditional approach with direct instantiation
import { MyMapper } from "./mappers/MyMapper";
import { EventMapper } from "./mappers/EventMapper";
import { SamsProducerInterface } from "./sams_common/samsProducerInterface";

export const handler = async (event: any, context?: any) => {
    const config = await Config.createInstance({ throwError: true });
    
    // Direct instantiation - tightly coupled
    const mapper = new MyMapper();
    const eventMapper = new EventMapper(config.logLevel);
    const interface = await SamsProducerInterface.createInstance(...config_params, mapper);
    
    // Process event...
}
```

#### After (Builder Pattern):
```typescript
// Builder pattern approach with dependency injection
import { Builder } from "./Builder";

export const handler = async (event: any, context?: any) => {
    const config = await Config.createInstance({ throwError: true });
    
    // Builder pattern - loose coupling and dependency injection
    const builder = new Builder(config);
    const mapper = builder.createMapper();
    const eventMapper = builder.createEventMapper?.(); // Optional based on pattern
    const interface = await builder.createProducerInterface?.(mapper); // Pattern-specific
    
    // Process event...
}
```

### Architecture Pattern Variations:

#### Producer Pattern Integration:
```typescript
// For Producer patterns (publishes to SAMS)
const builder = new Builder(config);
const producerMapper = builder.createMapper();
const eventMapper = builder.createEventMapper();
const producerInterface = await builder.createProducerInterface(producerMapper);

const sourceData = await eventMapper.mapToTarget(event);
const responses = await producerInterface.processDocument(sourceData[0]);
```

#### Consumer Pattern Integration:
```typescript
// For Consumer patterns (consumes from SAMS)
const builder = new Builder(config);
const consumerMapper = builder.createMapper();
const consumerInterface = await builder.createConsumerInterface();

const documents = await consumerInterface.getDocuments();
const transformedData = await consumerMapper.mapToTarget(documents);
```

#### Transformer Pattern Integration:
```typescript
// For Transformer patterns (processes and transforms)
const builder = new Builder(config);
const transformerMapper = builder.createMapper();
const transformerInterface = await builder.createTransformerInterface(transformerMapper);

const processedData = await transformerInterface.transform(inputData);
```

### Import Cleanup After Builder Integration:

After implementing the Builder pattern, clean up unused imports in your main handler file:

#### Imports to Remove:
- Direct mapper class imports (now created through Builder)
- Direct interface class imports (now created through Builder)
- Model class imports (handled by Builder/mapper typing)
- Service class imports (now created through Builder)

#### Imports to Keep:
- ESI Common Layer essentials (`ESILogger`, `ValidationError`, `ESIHealthCheckProvider`)
- Configuration classes (`Config`)
- Builder class (`Builder`)
- HTTP status codes and response utilities
- Health check utilities

#### Example Cleanup:
```typescript
// Before Builder integration
import { ESILogger, ValidationError, ESIHealthCheckProvider, ESITrackingServiceDocument } from "esi-common-layer";
import { MyMapper } from "./mappers/MyMapper";
import { EventMapper } from "./mappers/EventMapper";
import { SourceModel } from "./models/SourceModel";
import { TargetModel } from "./models/TargetModel";
import { SamsProducerInterface } from "./sams_common/samsProducerInterface";

// After Builder integration and cleanup
import { ESILogger, ValidationError, ESIHealthCheckProvider } from "esi-common-layer";
import { Config } from "./config";
import { Builder } from "./Builder";
import { HttpStatusCodes } from "./sams_common/httpStatusCodes";
import { InterfaceHealthChecker } from "./healthchecker";
```

## Deliverables

### Configuration Management:
- [ ] Config.ts refactored with private key-value objects
- [ ] Getter methods implemented for controlled access
- [ ] Module-level constants exported for external use
- [ ] All references updated to use getter methods

### Builder Pattern Implementation:
- [ ] Builder.ts created in src/ directory (not src/config/)
- [ ] Core component creation methods implemented based on architecture pattern
- [ ] Event mapper creation method (for Producer/Consumer patterns)
- [ ] Configuration validation and error handling
- [ ] Static factory method for Builder creation
- [ ] Complete component set creation method

### Main Handler Integration:
- [ ] Main handler file updated to use Builder pattern
- [ ] All direct instantiation replaced with Builder calls
- [ ] Unused imports cleaned up and removed
- [ ] Architecture pattern properly implemented (Producer/Consumer/Transformer)
- [ ] Error handling maintained through Builder integration

### Validation:
- [ ] All TypeScript compilation passes without errors
- [ ] Builder pattern creates components successfully
- [ ] Configuration validation works correctly
- [ ] Main handler functions correctly with new architecture
- [ ] Import statements are clean and minimal

## Success Criteria
- Configuration is properly encapsulated with controlled access
- Builder pattern successfully creates all required components
- Main handler integrates Builder without breaking existing functionality
- Code is cleaner with reduced coupling and improved maintainability
- All imports are necessary and unused imports are removed
- Architecture pattern (Producer/Consumer/Transformer) is correctly implemented
