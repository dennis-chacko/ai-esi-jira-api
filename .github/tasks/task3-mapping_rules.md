# Task 3: Model Schema Implementation and Event Mapping

## Objective
Implement comprehensive model classes based on schema definitions and implement event.body mapping logic in the Event-to-Source mapper to transform incoming events into validated source model instances.

## Prerequisites
Before starting this task, ensure the following are completed:
- Task 1 (Housekeeping) - File organization is complete
- Task 2 (Configuration Management) - OOP configuration is implemented
- Complete the Model Schema Mapping section in [project-planning-template.md](../project-planning-template.md) to identify all required models and their corresponding schemas
- Verify all schema files exist and are accessible

## Requirements

### Model Implementation
- Implement model classes according to the Model-to-Schema Mapping defined in [project-planning-template.md](../project-planning-template.md)
- Update each model class to match its corresponding schema structure
- Implement proper TypeScript interfaces, enums, and type definitions
- Add comprehensive JSDoc comments for all properties and methods
- Ensure models implement their designated interfaces (IDocument, ISamsDocument, etc.)

### Event Body Mapping Implementation
- Implement comprehensive mapping logic in the Event-to-Source mapper's `mapToTarget()` method (class name defined in [project-planning-template.md](../project-planning-template.md))
- Handle multiple event.body payload formats:
  - Direct JSON object in body
  - Nested JSON payload under `body.payload`
  - Direct ticket object under `body.ticket`
  - XML payload strings (with optional base64 encoding)
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

### Event Body Mapping Guidelines
- **Payload Detection**: Implement logic to detect and handle different payload formats:
  ```typescript
  // Handle different payload structures
  if (body.payload) {
    if (typeof body.payload === 'string') {
      // XML payload (potentially base64 encoded)
      ticketData = this._parseXmlPayload(body.payload);
    } else {
      // Nested JSON payload
      ticketData = body.payload;
    }
  } else if (body.ticket) {
    // Direct ticket object
    ticketData = body.ticket;
  } else {
    // Direct body as ticket data
    ticketData = body;
  }
  ```

- **XML Payload Handling**: Support both plain XML and base64-encoded XML:
  ```typescript
  private _parseXmlPayload(payloadString: string): any {
    // Check for base64 encoding and decode if necessary
    // Parse XML using fast-xml-parser
    // Extract ticket data from XML structure
  }
  ```

- **Field Mapping Strategy**: Map JSON fields to source model properties with validation:
  ```typescript
  // Required field extraction with validation
  const id = this._extractRequiredString(ticketData, 'id', 'Ticket ID');
  const title = this._extractRequiredString(ticketData, 'title', 'Ticket title');
  
  // Enum mapping with fallback values
  const status = this._mapStatus(ticketData.status);
  const priority = this._mapPriority(ticketData.priority);
  const type = this._mapType(ticketData.type);
  ```

- **User Information Mapping**: Handle flexible user object structures:
  ```typescript
  // Support multiple field name variations
  const id = userData.id || userData.userId || userData.user_id;
  const name = userData.name || userData.displayName || userData.display_name;
  ```

- **Array Processing**: Handle tags, comments, and identifiers arrays safely:
  ```typescript
  // Filter out invalid entries and provide meaningful warnings
  return comments.map((comment, index) => {
    try {
      // Map comment with validation
    } catch (error) {
      this.logger.warn(`Failed to map comment at index ${index}: ${error.message}`);
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
- Implement basic validation in constructors
- Use TypeScript's type system for compile-time validation
- Handle optional vs required properties appropriately
- Provide sensible defaults for required fields when not provided

## Deliverables
- [ ] All model classes updated according to the Model-to-Schema Mapping table
- [ ] All interfaces and enums properly defined and exported
- [ ] Comprehensive JSDoc documentation
- [ ] Models compile without TypeScript errors
- [ ] Complete Event-to-Source mapper.mapToTarget() implementation
- [ ] Support for multiple payload formats (JSON, XML, base64)
- [ ] Robust error handling and validation for all mapping scenarios

## Success Criteria
- Models accurately represent their respective schemas as defined in the mapping table
- All TypeScript compilation passes without errors
- Comprehensive type safety is maintained
- JSDoc documentation is complete and helpful
- Event-to-Source mapper successfully transforms various payload formats into source model instances
- Validation errors provide meaningful feedback for debugging
- XML and JSON payloads are handled seamlessly
- Field mapping includes proper enum validation and fallback values

## Notes
- **Model Focus**: Primarily modify files in the `src/models/` directory for schema compliance
- **Mapper Implementation**: Implement comprehensive mapping logic in Event-to-Source mapper's `mapToTarget()` method (class name defined in [project-planning-template.md](../project-planning-template.md))
- **DO NOT** modify test files unless they have compilation errors due to model changes
- **DO NOT** implement mapping logic in JsmTicketToItsmTicketMapper (separate future task)
- Follow the established OOP patterns and TypeScript conventions
- Use the ESILogger for debugging and validation error reporting
- Handle edge cases gracefully with appropriate error messages
- Ensure backward compatibility with existing payload formats
