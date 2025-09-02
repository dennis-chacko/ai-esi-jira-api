# Project Planning Template

## Overview
This template provides a structured approach to planning development projects. Use this template before starting implementation to ensure comprehensive project planning and reduce technical debt.

## Configuration Planning

### Before You Start
- [ ] Identify all environment variables your application needs
- [ ] Identify all AWS Secrets Manager keys your application needs
- [ ] Identify all AWS Parameter Store keys your application needs
- [ ] Define default values for development environment
- [ ] Plan environment-specific configurations (dev, staging, prod)

#### AWS Secrets Manager Keys
List all secrets that need to be stored securely:
- [ ] `ESI_OAUTH_SECRET_NAME` - OAuth authentication secret for ESI integration
- [ ] _Add more as needed..._

#### AWS Parameter Store Keys
List all configuration parameters that need centralized management:
- [ ] `SAMS_HOST_PARAM` - SAMS API host URL for publishing documents
- [ ] `PRODUCER_INTERFACE_KEY` - Producer interface identifier for SAMS integration
- [ ] _Add more as needed..._

### Builder Pattern Configuration

#### Component Definitions
Define the components that the Builder pattern should create:

##### Source-to-Target Mapper Component
- [ ] **Method Name**: `createMapper()`
- [ ] **Returns**: Instance of the Source-to-Target mapper class

##### Tracking Service Component
- [ ] **Method Name**: `createTrackingService()`
- [ ] **Returns**: `TrackingService` instance

##### Producer Interface Component
- [ ] **Method Name**: `createProducerInterface(mapper?)`
- [ ] **Returns**: `SamsProducerInterface` instance

## Model Schema Mapping

### Model-to-Schema Mapping
Define which model class should implement which schema:

- [ ] **JsmTicket.ts**
  - Schema File: `src/schema/sourceSchema.json`
  - Interface: `IDocument`
  - Description: Source model representing JSM ticket data

- [ ] **ItsmTIcket.ts**
  - Schema File: `src/schema/itsmTIcket.ts.json`
  - Interface: `ISamsDocument`
  - Description: Target model for ESI/SAMS integration

### Mapper Class Definitions
Define the mapper classes used in your project:

#### Event-to-Source Mapper
- [ ] **Class Name**: `EventToJsmTicketTranMapper`
- [ ] **Source**: Lambda event (event.body)
- [ ] **Target**: `JsmTicket` model
- [ ] **Description**: Maps incoming Lambda event payload to JSM ticket source model

#### Source-to-Target Mapper
- [ ] **Class Name**: `JsmTicketToItsmTicketMapper`
- [ ] **Source**: `JsmTicket` model
- [ ] **Target**: `ItsmTicket` model
- [ ] **Description**: Transforms JSM ticket data to ITSM format for SAMS integration

#### Additional Mappers
- [ ] **Class Name**: `_MapperClassName_`
- [ ] **Source**: `_SourceType_`
- [ ] **Target**: `_TargetType_`
- [ ] **Description**: `_Description_`

