const jsonPayload = `{
    "TransactionDate": "2025-07-28",
    "SupportCenter": "D",
    "TransactingStore_Banner": "AKRON",
    "CreditedStore_SAPSiteId": "TX003",
    "SubLine": 1,
    "EventType": "OTHER_SALE",
    "TransactingStore_LegacyStoreId": "333",
    "LastModifiedDateTime": "2025-05-10T09:53:47",
    "LastModifiedByUser": "user789",
    "CompanyCode": "D",
    "TransactionNumber": "TXN111",
    "ProductCode": "SKU200",
    "CreditedStore_LegacyStoreId": "333",
    "RetailTypeCode": "S602",
    "CreditedValue": "400.54",
    "Quantity": "2",
    "TransactingStore_SAPSiteId": "A5092",
    "CreditedEmployeeId": "123456",
    "WorkstationId": "WS888",
    "LineItemId": "3",
    "UpdateSource": "S"
}`;
 
const { handler } = require("../dist/index");
 
(async () => {
  const event = {
    headers: {
      "Content-Type": "application/json",
      "Native-Business-Id": "20250115_1005_A",
      "Document-Key": "816ee5fc-bd7a-458b-be01-03d124dc234b",
      "Batch-Key": ""
    },
    body: jsonPayload,
    path: "/healthcheck",
    httpMethod: "POST",
    queryStringParameters: {
    returnMapping: "1"
  }
  };
 
  const context = {
    functionName: "esi-sim-salesAttribution-producer",
    logGroupName: "/aws/lambda/esi-sim-salesAttribution-producer",
  };
 
  const res = await handler(event, context);
 
  console.log(res);
 
})();
 