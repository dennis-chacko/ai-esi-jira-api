#!/bin/bash

echo "Testing Local ESI JSM Ticket Producer API"
echo "=========================================="

# Base URL for local API Gateway
BASE_URL="http://127.0.0.1:3000"

echo ""
echo "1. Testing Health Check (POST /healthcheck)..."
curl -X POST $BASE_URL/healthcheck \
  -H "Content-Type: application/json" \
  -d '{"action": "healthcheck"}' \
  --silent --show-error | jq '.' || echo "Health check failed or jq not available"

echo ""
echo "2. Testing Health Check (GET /health)..."
curl -X GET $BASE_URL/health \
  --silent --show-error | jq '.' || echo "Health check failed or jq not available"

echo ""
echo "3. Testing Process Ticket (POST /process-ticket)..."
curl -X POST $BASE_URL/process-ticket \
  -H "Content-Type: application/json" \
  -H "Native-Business-Id: JSM-12345" \
  -H "Document-Key: ticket-001" \
  -d '{"payload": "<ticket><id>JSM-12345</id><title>Sample JSM Ticket</title><description>This is a test ticket for local Lambda execution</description><status>Open</status><priority>Medium</priority><type>Incident</type><createdAt>2025-08-29T10:00:00Z</createdAt><updatedAt>2025-08-29T10:00:00Z</updatedAt><reporter><id>user123</id><name>John Doe</name><email>john.doe@example.com</email></reporter><assignee><id>user456</id><name>Jane Smith</name><email>jane.smith@example.com</email></assignee><tags>urgent,customer-issue</tags><customFields><department>IT</department><severity>high</severity></customFields></ticket>"}' \
  --silent --show-error | jq '.' || echo "Process ticket failed or jq not available"

echo ""
echo "=========================================="
echo "Test completed!"
