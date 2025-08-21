import { ESIHealthCheckProvider } from 'esi-common-layer';
import { Config } from './config';

/**
 * Utility class for performing health checks.
 */
export class InterfaceHealthChecker {
    static async performHealthCheck(context: any, config: Config): Promise<any> {
        // Create a HealthCheckMaster instance
        const healthcheckMaster = new ESIHealthCheckProvider.HealthCheckMaster(context);

        // Add important configs as a health check resource
        const configResource = new ESIHealthCheckProvider.Resource(
            'Configuration',
            ESIHealthCheckProvider.ResourceType.CONFIGURATION,
            [config],
            [],
            ESIHealthCheckProvider.IsOk.OK,
            async () => {
                return await config.loadConfigWithoutErrorThrow() as { errors?: any[]; details?: any[]; };
            }
        );
        healthcheckMaster.addResource(configResource);

        // Check for getting OAuth token access
        const azureAuthChecker = new ESIHealthCheckProvider.AzureOAuthResource(config.esiOAuthSecretName);
        healthcheckMaster.addResource(azureAuthChecker);

        // Evaluate all resources and get the health check summary
        const summary = await healthcheckMaster.evaluateAllAndGetSummary();

        // Sanitize and return the summary object
        return sanitizeObject(summary);
    }
}

// Function to sanitize the object with depth limit
const sanitizeObject = (obj: any, depth: number = 0): any => {
    if (depth > 10) { // Limit recursion depth
        return '[Max Depth Reached]';
    }

    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (obj instanceof Date) {
        return obj.toISOString();
    }

    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item, depth + 1));
    }

    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
        if (key === '_readableState' || key === 'parent' || key === 'socket') {
            continue;
        }
        sanitized[key] = sanitizeObject(value, depth + 1);
    }
    return sanitized;
};
