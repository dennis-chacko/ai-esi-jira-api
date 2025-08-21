import { ESILogger, ValidationError, ESIHealthCheckProvider, ESITrackingServiceDocument } from "esi-common-layer";
import { Config } from "./config";
import { SamsProducerInterface } from "./sams_common/samsProducerInterface";
import { HttpStatusCodes } from "./sams_common/httpStatusCodes";
import { InterfaceHealthChecker } from "./healthchecker";
import { JsmTicket } from "./models/JsmTicket";
import { ItsmTIcket } from "./models/ItsmTIcket";
import { JsmTicketToItsmTicketMapper } from "./mappers/JsmTicketToItsmTicketMapper";
import { EventToJsmTicketTranMapper } from "./mappers/EventToJsmTicketTranMapper";
/*==================================================================================================
 * Top level event handler for lambda.  It all starts here.
 */
export const handler = async (event: any, context?: any) => {

    let logger: any;

    const responseBody = {
        input: null,
        output: null
    }

    try {
        logger = ESILogger.getLogger('Index');

        if (ESIHealthCheckProvider.HealthCheckMaster.isHealthCheckEvent(event)) {
            const config = await Config.createInstance({ throwError: false });
            const healthCheckResult = await InterfaceHealthChecker.performHealthCheck(context, config);
            return createLambdaResponse(HttpStatusCodes.OK, healthCheckResult);
        }

        const config = await Config.createInstance({ throwError: true });

        // Create producer mapper
        const producerMapper = new JsmTicketToItsmTicketMapper();

        // the producer interface takes the producerMapper for transformation to publish documents based on transformed transaction
        const producerInterface = await SamsProducerInterface.createInstance<JsmTicket , ItsmTIcket>(
            config.esiOAuthSecretName,
            config.logLevel,
            config.samsAPIURL,
            config.producerInterfaceKey,
            config.esiEnvironment,
            producerMapper
        );

        const transaction  = await new EventToJsmTicketTranMapper(config.logLevel).mapToTarget(event);

        const responses = await producerInterface.processDocument(transaction[0]);

        responseBody.output = responses;

        const httpStatus = responses.some(res => res.errorMessage) ? HttpStatusCodes.InternalServerError : HttpStatusCodes.OK;

        return createLambdaResponse(httpStatus, responseBody);

    } catch (error) {

        let message = error instanceof ValidationError ? ValidationError.getErrorMessage(error) : error?.message
        logger.error(message);

        const httpStatus = error instanceof ValidationError || message.includes('Validation Failed')
            ? HttpStatusCodes.BadRequest
            : HttpStatusCodes.InternalServerError;

        return createLambdaResponse(httpStatus, {
            input: {
                native_business_id: event?.headers["Native-Business-Id"],
                document_key: event?.headers["Document-Key"]
            },
            output: [],
            errors: [{
                code: error instanceof ValidationError ? 'VALIDATION_ERROR' : 'INTERNAL_SERVER_ERROR',
                message
            }]
        });
    }

}


/*==================================================================================================
 * Helper function to generate the output that is expected from lambdas
 */
function createLambdaResponse(statusCode: number, body: any): any {
    return {
        statusCode,
        body: JSON.stringify(body),
        headers: {
            "content-type": "application/json",
        }
    }
}