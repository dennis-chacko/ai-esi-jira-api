# ESI JSM Ticket Producer Lambda

AWS Lambda function for processing JSM tickets and publishing to SAMS for downstream consumption.

## Overview

This Lambda function:
- Accepts JSM ticket data via HTTP API
- Validates and transforms the ticket data
- Publishes the transformed data to SAMS
- Provides health check endpoints for monitoring

## Prerequisites

### Required Software
1. **Node.js 18.x** or later
2. **Docker Desktop** - Must be running for SAM local execution
3. **AWS SAM CLI** - For local Lambda testing
4. **VS Code** or similar IDE (recommended)

### AWS Setup
1. **AWS DevOps Account Access** (481270058004) for code artifact repository
2. **AWS Credentials Configuration**:
   - Go to https://d-9a672aecfb.awsapps.com/start/#/
   - Copy credentials from `signet-aws-devops-test` (programmatic access)
   - Configure in `~/.aws/credentials`:
     ```
     [default]
     aws_access_key_id = YOUR_ACCESS_KEY
     aws_secret_access_key = YOUR_SECRET_KEY
     aws_session_token = YOUR_SESSION_TOKEN
     ```
   - Configure region in `~/.aws/config`:
     ```
     [default]
     region = us-east-2
     ```

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/dennis-chacko/ai-esi-jira-api.git
   cd ai-esi-jira-api
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   - All environment variables are configured in `template.yaml`
   - Update any configuration in `src/config.ts` if needed

## Building and Running Locally

### Quick Start
```bash
# Build and start the local API Gateway
npm run sam:api

# The API will be available at: http://127.0.0.1:3000
```

### Available Commands

| Command | Description |
|---------|-------------|
| `npm run sam:api` | Build and start local API Gateway |
| `npm run sam:local` | Test single Lambda invocation with health check |
| `npm run sam:invoke` | Invoke Lambda function directly |
| `npm run build:local` | Build for local development (webpack bundling) |
| `npm run clean:local` | Clean build artifacts |
| `npm test` | Run Jest tests |

## API Endpoints

When running locally (`npm run sam:api`), the following endpoints are available:

### 1. Process Ticket
- **URL**: `POST http://127.0.0.1:3000/process-ticket`
- **Purpose**: Main endpoint for processing JSM tickets
- **Headers**:
  - `Content-Type: application/json`
  - `Native-Business-Id: {ticket-id}` (optional)
  - `Document-Key: {document-key}` (optional)

### 2. Health Check (POST)
- **URL**: `POST http://127.0.0.1:3000/healthcheck`
- **Purpose**: Health status check
- **Headers**: `Content-Type: application/json`

### 3. Health Check (GET)
- **URL**: `GET http://127.0.0.1:3000/health`
- **Purpose**: Alternative health status check

## Testing with cURL

### 1. Health Check (POST)
```bash
curl -X POST http://127.0.0.1:3000/healthcheck \
  -H "Content-Type: application/json" \
  -d '{"action": "healthcheck"}'
```

**Sample Response:**
```json
{
  "statusCode": 200,
  "body": "{\"status\":\"ok\",\"checkTime\":\"2025-08-29T19:45:28.366Z\",\"resources\":[{\"name\":\"JsmTicketProducerFunction\",\"type\":\"LAMBDA\",\"details\":[{\"memoryLimitInMB\":\"512\",\"logGroupName\":\"aws/lambda/JsmTicketProducerFunction\"}],\"error\":[],\"isOk\":\"ok\"},{\"name\":\"Configuration\",\"type\":\"CONFIGURATION\",\"details\":[{\"logLevel\":\"DEBUG\",\"producerInterfaceKey\":\"jsm_ticket_producer\",\"esiOAuthSecretName\":\"esi/interface/jsm/oauth\",\"samsHostParam\":\"/esi/interface/common/sams_host\",\"parameterStore\":null,\"errors\":[],\"esiEnvironment\":\"dev\",\"esiAuthToken\":\"[REDACTED]\",\"samsAPIURL\":\"https://esi.dev.cloud.jewels.com/sams/api/v1/async-message-api\"}],\"error\":[],\"isOk\":\"ok\"},{\"name\":\"esi/interface/jsm/oauth\",\"type\":\"AZURE_OAUTH\",\"details\":[\"OAuth token has been successfully generated using the secret ID: esi/interface/jsm/oauth\"],\"error\":[],\"isOk\":\"ok\"}]}",
  "headers": {
    "content-type": "application/json"
  }
}
```

### 2. Health Check (GET)
```bash
curl -X GET http://127.0.0.1:3000/health
```

**Sample Response:**
```json
{
  "statusCode": 200,
  "body": "{\"status\":\"ok\",\"checkTime\":\"2025-08-29T19:45:28.366Z\",\"resources\":[{\"name\":\"JsmTicketProducerFunction\",\"type\":\"LAMBDA\",\"details\":[{\"memoryLimitInMB\":\"512\",\"logGroupName\":\"aws/lambda/JsmTicketProducerFunction\"}],\"error\":[],\"isOk\":\"ok\"}]}",
  "headers": {
    "content-type": "application/json"
  }
}
```

### 3. Process JSM Ticket
```bash
curl -X POST http://127.0.0.1:3000/process-ticket \
  -H "Content-Type: application/json" \
  -H "Native-Business-Id: JSM-12345" \
  -H "Document-Key: ticket-001" \
  -d '{
    "payload": "<ticket><id>JSM-12345</id><title>Sample JSM Ticket</title><description>This is a test ticket for local Lambda execution</description><status>Open</status><priority>Medium</priority><type>Incident</type><createdAt>2025-08-29T10:00:00Z</createdAt><updatedAt>2025-08-29T10:00:00Z</updatedAt><reporter><id>user123</id><name>John Doe</name><email>john.doe@example.com</email></reporter><assignee><id>user456</id><name>Jane Smith</name><email>jane.smith@example.com</email></assignee><tags>urgent,customer-issue</tags><customFields><department>IT</department><severity>high</severity></customFields></ticket>"
  }'
```

**Sample Response (Success):**
```json
{
  "statusCode": 200,
  "body": "{\"input\":{\"headers\":{\"Native-Business-Id\":\"JSM-12345\",\"Document-Key\":\"ticket-001\"},\"body\":{\"payload\":\"<ticket>...</ticket>\"}},\"output\":[{\"id\":\"jsm-ticket-001\",\"type\":\"ITSM_TICKET\",\"status\":\"PROCESSED\",\"timestamp\":\"2025-08-29T10:00:00Z\"}]}",
  "headers": {
    "content-type": "application/json"
  }
}
```

**Sample Response (Validation Error):**
```json
{
  "statusCode": 400,
  "body": "{\"errors\":[\"Missing required field: ticket ID\",\"Invalid status value\"],\"message\":\"Validation failed\"}",
  "headers": {
    "content-type": "application/json"
  }
}
```

**Sample Response (Server Error):**
```json
{
  "statusCode": 500,
  "body": "{\"error\":\"Internal server error\",\"message\":\"Failed to process ticket\",\"timestamp\":\"2025-08-29T10:00:00Z\"}",
  "headers": {
    "content-type": "application/json"
  }
}
```

### 4. Alternative JSON Payload Format
For easier testing, you can also use a more structured JSON format:

```bash
curl -X POST http://127.0.0.1:3000/process-ticket \
  -H "Content-Type: application/json" \
  -H "Native-Business-Id: JSM-12345" \
  -H "Document-Key: ticket-001" \
  -d '{
    "ticket": {
      "id": "JSM-12345",
      "title": "Sample JSM Ticket",
      "description": "This is a test ticket for local Lambda execution",
      "status": "Open",
      "priority": "Medium",
      "type": "Incident",
      "createdAt": "2025-08-29T10:00:00Z",
      "updatedAt": "2025-08-29T10:00:00Z",
      "reporter": {
        "id": "user123",
        "name": "John Doe",
        "email": "john.doe@example.com"
      },
      "assignee": {
        "id": "user456",
        "name": "Jane Smith",
        "email": "jane.smith@example.com"
      },
      "tags": ["urgent", "customer-issue"],
      "customFields": {
        "department": "IT",
        "severity": "high"
      }
    }
  }'
```

### Automated Testing
Use the provided test script to test all endpoints:
```bash
./test-local-api.sh
```

## Testing with Postman

### 1. Health Check (POST)
- **Method:** POST
- **URL:** `http://127.0.0.1:3000/healthcheck`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body (raw JSON):**
  ```json
  {
    "action": "healthcheck"
  }
  ```

### 2. Health Check (GET)
- **Method:** GET
- **URL:** `http://127.0.0.1:3000/health`
- **Headers:** None required

### 3. Process JSM Ticket (XML Payload)
- **Method:** POST
- **URL:** `http://127.0.0.1:3000/process-ticket`
- **Headers:**
  ```
  Content-Type: application/json
  Native-Business-Id: JSM-12345
  Document-Key: ticket-001
  ```
- **Body (raw JSON):**
  ```json
  {
    "payload": "<ticket><id>JSM-12345</id><title>Sample JSM Ticket</title><description>This is a test ticket for local Lambda execution</description><status>Open</status><priority>Medium</priority><type>Incident</type><createdAt>2025-08-29T10:00:00Z</createdAt><updatedAt>2025-08-29T10:00:00Z</updatedAt><reporter><id>user123</id><name>John Doe</name><email>john.doe@example.com</email></reporter><assignee><id>user456</id><name>Jane Smith</name><email>jane.smith@example.com</email></assignee><tags>urgent,customer-issue</tags><customFields><department>IT</department><severity>high</severity></customFields></ticket>"
  }
  ```

### 4. Process JSM Ticket (JSON Object Payload)
- **Method:** POST
- **URL:** `http://127.0.0.1:3000/process-ticket`
- **Headers:**
  ```
  Content-Type: application/json
  Native-Business-Id: JSM-54321
  Document-Key: ticket-002
  ```
- **Body (raw JSON):**
  ```json
  {
    "ticket": {
      "id": "JSM-54321",
      "title": "Database Connection Issue",
      "description": "Users reporting inability to connect to the database server",
      "status": "In Progress",
      "priority": "High",
      "type": "Bug",
      "createdAt": "2025-08-29T14:30:00Z",
      "updatedAt": "2025-08-29T15:00:00Z",
      "reporter": {
        "id": "user789",
        "name": "Alice Johnson",
        "email": "alice.johnson@example.com"
      },
      "assignee": {
        "id": "user101",
        "name": "Bob Wilson",
        "email": "bob.wilson@example.com"
      },
      "tags": ["database", "connection", "critical"],
      "customFields": {
        "department": "Infrastructure",
        "severity": "critical",
        "affectedSystems": ["database-01", "database-02"]
      }
    }
  }
  ```

### 5. Error Testing Examples

#### Missing Required Headers
- **Method:** POST
- **URL:** `http://127.0.0.1:3000/process-ticket`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body (raw JSON):**
  ```json
  {
    "payload": "<ticket><id>JSM-ERROR</id></ticket>"
  }
  ```
- **Expected Response:** 400 Bad Request with validation errors

#### Invalid Payload Format
- **Method:** POST
- **URL:** `http://127.0.0.1:3000/process-ticket`
- **Headers:**
  ```
  Content-Type: application/json
  Native-Business-Id: JSM-INVALID
  Document-Key: ticket-error
  ```
- **Body (raw JSON):**
  ```json
  {
    "invalid": "payload structure"
  }
  ```
- **Expected Response:** 400 Bad Request with validation errors

### Import Collection
You can create a Postman collection with the following structure for easy testing:

1. Create a new collection named "ESI JSM Ticket Producer"
2. Add requests for each endpoint above
3. Set up environment variables for easy switching between environments:
   - `baseUrl`: `http://127.0.0.1:3000`
   - `businessId`: `JSM-12345`
   - `documentKey`: `ticket-001`

## Project Structure

```
├── src/
│   ├── mappers/              # Data transformation logic
│   ├── models/               # Data models and interfaces
│   ├── sams_common/          # SAMS integration utilities
│   ├── config.ts             # Configuration management
│   ├── index.ts              # Lambda entry point
│   └── healthchecker.ts      # Health check implementation
├── template.yaml             # AWS SAM template (local development)
├── webpack.local.config.js   # Webpack config for local development
└── test-local-api.sh         # Automated test script
```

## Development Workflow

1. **Start Development**:
   ```bash
   npm run sam:api
   ```

2. **Make Code Changes**: 
   - Edit files in `src/`
   - Changes are reflected automatically (hot reload)

3. **Test Changes**:
   - Use cURL, Postman, or the test script
   - Check console output for logs

4. **Rebuild if Needed**:
   - Stop the API (Ctrl+C)
   - Run `npm run sam:api` again

## Troubleshooting

### Common Issues

1. **Docker not running**:
   - Ensure Docker Desktop is running
   - Check with: `docker info`

2. **Port 3000 already in use**:
   - Stop other services using port 3000
   - Or kill the process: `lsof -ti:3000 | xargs kill`

3. **AWS credentials expired**:
   - Refresh credentials from AWS SSO portal
   - Update `~/.aws/credentials`

4. **Build failures**:
   - Clean and rebuild: `npm run clean:local && npm run sam:api`

### Logs and Debugging

- **Lambda logs**: Check console output when API is running
- **Build logs**: Available during `npm run sam:api`
- **AWS logs**: CloudWatch logs (when deployed to AWS)

## Environment Variables

| Name | Description | Default Value |
|------|-------------|---------------|
| `NODE_ENV` | Application environment | `dev` |
| `LOG_LEVEL` | Logging level | `DEBUG` |
| `ESI_ENVIRONMENT` | ESI environment identifier | `dev` |
| `PRODUCER_INTERFACE_KEY` | SAMS producer interface key | `jsm_ticket_producer` |
| `ESI_OAUTH_SECRET_NAME` | AWS Secrets Manager secret name | `esi/interface/jsm/oauth` |
| `SAMS_HOST_PARAM` | Parameter Store key for SAMS host | `/esi/interface/common/sams_host` |
