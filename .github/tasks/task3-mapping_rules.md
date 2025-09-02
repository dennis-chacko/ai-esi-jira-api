# Task 3: Model Schema Implementation and Event Mapping

## Objective
Implement comprehensive model classes based on schema definitions and implement event.body mapping logic in the Event-to-Source mapper to transform incoming events into validated source model instances for the **Producer Pattern**.

**Note**: This is a Producer Pattern implementation that transforms incoming events into canonical ESI documents for SAMS publishing. Producer patterns focus on event.body processing and do not require validation of Consumer Pattern headers like `Document-Key` or `Native-Business-Id`.

## Prerequisites
Before starting this task, ensure the following are completed:
- Task 1 (Housekeeping) - File organization is complete
- Task 2 (Configuration Management) - OOP configuration is implemented
- Complete the Model Schema Mapping section in [project-planning-template.md](../project-planning-template.md) to identify all required models and their corresponding schemas
- Verify all schema files exist and are accessible
- Review the `src/mappingRules.csv` file to understand field validation requirements and mapping rules

## Requirements

### Model Implementation
- Implement model classes according to the Model-to-Schema Mapping defined in [project-planning-template.md](../project-planning-template.md)
- Update each model class to match its corresponding schema structure
- Implement proper TypeScript interfaces, enums, and type definitions
- Add comprehensive JSDoc comments for all properties and methods
- Ensure models implement their designated interfaces (IDocument, ISamsDocument, etc.)

### Event Body Mapping Implementation
- Implement comprehensive mapping logic in the Event-to-Source mapper's `mapToTarget()` method (class name defined in [project-planning-template.md](../project-planning-template.md))
- **Producer Pattern Focus**: Validate event.body structure and content, not Consumer Pattern headers
- Handle multiple event.body JSON payload formats:
  - Direct JSON object in body
  - Nested JSON payload under `body.payload`
  - Direct ticket object under `body.ticket`
- Transform event.body data into validated source model instances
- Implement robust error handling and validation for all payload formats

### Schema Compliance
- All required properties from schemas must be implemented
- Optional properties should be properly typed as optional
- Enum values must match schema definitions exactly
- Date fields should be properly typed as strings (ISO format)

### Type Safety
- Use TypeScript enums for status, priority, type fields
- Create interfaces for complex nested objects (UserInfo, Comments, etc.)
- Implement proper constructors with validation
- Add getJson() methods with appropriate return types

## Implementation Guidelines

### Model Structure
- Use PascalCase for class names and enum names
- Use camelCase for property names and method names
- Group related interfaces and enums within model files
- Add proper export statements for reusability

### Source-to-Target Mapping Guidelines

**Note**: The following pattern demonstrates how to implement mapToTarget method for Source-to-Target mapper classes based on mappingRules.csv specifications.

- **Complete mapToTarget Implementation Pattern**:
  ```typescript
  public async mapToTarget(sourceModel: SourceModel): Promise<TargetModel[]> {
    const targetModel = new TargetModel();
    
    // Core ESI document properties
    targetModel.documentKey = this.createDocumentKey();
    targetModel.nativeBusinessId = this.assignNativeBusinessId(sourceModel);

    // Map properties based on mappingRules.csv
    // Required fields (Y in mappingRules.csv):
    // targetModel.id = sourceModel.id;
    // targetModel.title = sourceModel.title;
    // targetModel.description = sourceModel.description;
    // targetModel.type = sourceModel.type;
    
    // Optional fields (N in mappingRules.csv):
    // targetModel.identifiers = sourceModel.identifiers;
    // targetModel.status = sourceModel.status;
    // targetModel.priority = sourceModel.priority;
    // targetModel.createdAt = sourceModel.createdAt;
    // targetModel.updatedAt = sourceModel.updatedAt;
    // targetModel.reporter = sourceModel.reporter;
    // targetModel.assignee = sourceModel.assignee;
    // targetModel.customFields = sourceModel.customFields;
    // targetModel.tags = sourceModel.tags;
    // targetModel.comments = sourceModel.comments;

    return [targetModel];
  }
  ```

- **Document Key Creation Pattern**:
  ```typescript
  private createDocumentKey(): string {
    // Implement document key creation logic based on business requirements
    // Update this logic once source model has proper properties implemented
    return `document-${Date.now()}`;
  }
  ```

- **Native Business ID Assignment Pattern**:
  ```typescript
  private assignNativeBusinessId(sourceModel: SourceModel): string {
    // Based on mappingRules.csv, identify field marked with 'Y' for nativeBusinessId
    // Use the designated field (typically 'id') for native business ID
    // TODO: Access the designated property once source model is properly implemented
    
    // This should be: return sourceModel.id; (or designated field)
    // Once source model implements the property from mappingRules.csv
    return `source-${Date.now()}`; // Temporary implementation
  }
  ```

### Event Body Mapping Guidelines

**Note**: The following code samples are for guidance only. Analyze the actual source schema and mappingRules.csv file to determine the specific field mappings required for this project.

- **Payload Detection**: Detect and handle different JSON payload formats:
  ```typescript
  // Handle different JSON payload structures
  // Adapt these patterns to the specific payload structure found in the project
  let sourceData;
  if (body.payload) {
    // Nested JSON payload
    sourceData = body.payload;
  } else if (body.data) {
    // Direct data object
    sourceData = body.data;
  } else {
    // Direct body as source data
    sourceData = body;
  }
  ```

- **Field Mapping Strategy**: Map JSON fields to source model properties with validation:
  ```typescript
  // Map fields based on the source schema and mappingRules.csv
  // Use the actual field names and validation logic from the project files
  const id = this._extractRequiredString(sourceData, 'id', 'ID');
  const title = this._extractRequiredString(sourceData, 'title', 'Title');
  
  // Enum mapping with fallback values (use the actual schema enums)
  const status = this._mapStatus(sourceData.status);
  const priority = this._mapPriority(sourceData.priority);
  const type = this._mapType(sourceData.type);
  ```

- **User Information Mapping**: Handle flexible user object structures:
  ```typescript
  // Support multiple field name variations
  // Determine the actual user data structure from the schema
  const id = userData.id || userData.userId || userData.user_id;
  const name = userData.name || userData.displayName || userData.display_name;
  ```

- **Array Processing**: Handle arrays safely with validation:
  ```typescript
  // Process arrays with error handling
  // Use the specific array types and validation requirements from the schema
  return items.map((item, index) => {
    try {
      // Map item with validation based on the actual schema
    } catch (error) {
      this.logger.warn(`Failed to map item at index ${index}: ${error.message}`);
      return null;
    }
  }).filter(Boolean);
  ```

### Documentation Requirements
- Add comprehensive JSDoc comments to all classes, interfaces, and enums
- Document all constructor parameters and their purposes
- Include examples in JSDoc where helpful
- Mark AI-generated code with appropriate headers
- Document payload format expectations and mapping logic

### Validation Strategy
- Implement validation based on mappingRules.csv file requirements
- Use the mappingRules.csv file as the single source of truth for field validation rules
- Validate all required fields (marked with 'Y' in the CSV) before processing
- Implement format-specific validation for email addresses and date fields
- Use TypeScript's type system for compile-time validation
- Handle optional vs required properties according to mappingRules.csv specifications
- Provide meaningful error messages that reference the specific validation failure

### mappingRules.csv Validation Implementation
- **Validation Helper Methods**: Implement reusable validation methods:
  ```typescript
  private _validateRequiredString(data: any, fieldName: string, displayName: string): void {
    const value = data[fieldName];
    if (!value || typeof value !== 'string' || value.trim().length === 0) {
      this._throwValidationError(`${displayName} is required and must be a non-empty string`);
    }
  }
  
  private _validateEmail(displayName: string, email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      this._throwValidationError(`${displayName} must be a valid email address`);
    }
  }
  ```

## Deliverables
- [ ] All model classes updated according to the Model-to-Schema Mapping table
- [ ] All interfaces and enums properly defined and exported
- [ ] Comprehensive JSDoc documentation
- [ ] Models compile without TypeScript errors
- [ ] Complete Event-to-Source mapper.mapToTarget() implementation
- [ ] Complete Source-to-Target mapper.mapToTarget() implementation with mappingRules.csv-based field mapping
- [ ] Document key creation and native business ID assignment methods
- [ ] Support for multiple JSON payload formats
- [ ] Robust error handling and validation for all mapping scenarios
- [ ] Validation implementation based on mappingRules.csv requirements
- [ ] Required field validation for all fields marked 'Y' in mappingRules.csv
- [ ] Format validation for email addresses and ISO date fields

## Success Criteria
- Models accurately represent their respective schemas as defined in the mapping table
- All TypeScript compilation passes without errors
- Comprehensive type safety is maintained
- JSDoc documentation is complete and helpful
- Event-to-Source mapper successfully transforms various JSON payload formats into source model instances
- Source-to-Target mapper implements complete field mapping based on mappingRules.csv specifications
- Document key creation and native business ID assignment methods are properly implemented
- Validation errors provide meaningful feedback for debugging
- JSON payloads are handled seamlessly
- Field mapping includes proper enum validation and fallback values
- All required fields from mappingRules.csv are properly validated
- Email and date format validation works correctly for optional fields

## Notes
- **Producer Pattern Implementation**: This project implements the Producer Pattern which focuses on transforming event.body data into canonical ESI documents for SAMS publishing
- **Model Focus**: Primarily modify files in the `src/models/` directory for schema compliance
- **Mapper Implementation**: Implement comprehensive mapping logic in Event-to-Source mapper's `mapToTarget()` method (class name defined in [project-planning-template.md](../project-planning-template.md))
- **Header Validation**: Producer patterns do not validate Consumer Pattern headers like `Document-Key` or `Native-Business-Id`
- **DO NOT** modify test files unless they have compilation errors due to model changes
- **DO NOT** implement mapping logic in JsmTicketToItsmTicketMapper (separate future task)
- Follow the established OOP patterns and TypeScript conventions
- Use the ESILogger for debugging and validation error reporting
- Handle edge cases gracefully with appropriate error messages
- Ensure backward compatibility with existing JSON payload formats
