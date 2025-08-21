import { InterfaceHealthChecker } from '../healthchecker';
import { ESIHealthCheckProvider } from 'esi-common-layer';

// Mock ESIHealthCheckProvider
jest.mock('esi-common-layer', () => ({
    ESIHealthCheckProvider: {
        HealthCheckMaster: jest.fn(),
        Resource: jest.fn(),
        ResourceType: {
            CONFIGURATION: 'CONFIGURATION'
        },
        IsOk: {
            OK: 'OK'
        },
        AzureOAuthResource: jest.fn()
    }
}));

describe('InterfaceHealthChecker', () => {
    let mockContext: any;
    let mockConfig: any;
    let mockHealthCheckMaster: any;
    let mockAddResource: jest.Mock;
    let mockEvaluateAllAndGetSummary: jest.Mock;

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Setup mock context and config
        mockContext = {};
        mockConfig = {
            esiOAuthSecretName: 'test-secret',
            loadConfigWithoutErrorThrow: jest.fn()
        };

        // Setup mock HealthCheckMaster
        mockAddResource = jest.fn();
        mockEvaluateAllAndGetSummary = jest.fn();
        mockHealthCheckMaster = {
            addResource: mockAddResource,
            evaluateAllAndGetSummary: mockEvaluateAllAndGetSummary
        };

        (ESIHealthCheckProvider.HealthCheckMaster as unknown as jest.Mock).mockImplementation(() => mockHealthCheckMaster);
    });

    describe('performHealthCheck', () => {
        it('should perform health check successfully', async () => {
            const mockConfigResponse = { details: ['test'], errors: [] };
            mockConfig.loadConfigWithoutErrorThrow.mockResolvedValue(mockConfigResponse);
            mockEvaluateAllAndGetSummary.mockResolvedValue({ status: 'healthy' });

            const result = await InterfaceHealthChecker.performHealthCheck(mockContext, mockConfig);

            expect(ESIHealthCheckProvider.HealthCheckMaster).toHaveBeenCalledWith(mockContext);
            expect(ESIHealthCheckProvider.Resource).toHaveBeenCalled();
            expect(ESIHealthCheckProvider.AzureOAuthResource).toHaveBeenCalledWith('test-secret');
            expect(mockAddResource).toHaveBeenCalledTimes(2);
            expect(mockEvaluateAllAndGetSummary).toHaveBeenCalled();
            expect(result).toEqual({ status: 'healthy' });
        });

        it('should handle errors in config loading', async () => {
            const mockConfigResponse = { errors: ['error1'], details: [] };
            mockConfig.loadConfigWithoutErrorThrow.mockResolvedValue(mockConfigResponse);
            mockEvaluateAllAndGetSummary.mockResolvedValue({ status: 'unhealthy' });

            const result = await InterfaceHealthChecker.performHealthCheck(mockContext, mockConfig);

            expect(result).toEqual({ status: 'unhealthy' });
        });
    });

    describe('sanitizeObject', () => {
        it('should handle null values', async () => {
            mockEvaluateAllAndGetSummary.mockResolvedValue(null);
            const result = await InterfaceHealthChecker.performHealthCheck(mockContext, mockConfig);
            expect(result).toBeNull();
        });

        it('should handle Date objects', async () => {
            const date = new Date('2023-01-01');
            mockEvaluateAllAndGetSummary.mockResolvedValue({ date });
            const result = await InterfaceHealthChecker.performHealthCheck(mockContext, mockConfig);
            expect(result.date).toBe(date.toISOString());
        });

        it('should handle arrays', async () => {
            mockEvaluateAllAndGetSummary.mockResolvedValue({ array: [1, 2, 3] });
            const result = await InterfaceHealthChecker.performHealthCheck(mockContext, mockConfig);
            expect(result.array).toEqual([1, 2, 3]);
        });

        it('should skip specific keys', async () => {
            mockEvaluateAllAndGetSummary.mockResolvedValue({
                _readableState: 'skip',
                parent: 'skip',
                socket: 'skip',
                keep: 'keep'
            });
            const result = await InterfaceHealthChecker.performHealthCheck(mockContext, mockConfig);
            expect(result).toEqual({ keep: 'keep' });
        });

        it('should handle max depth', async () => {
            const deepObject = {};
            let current = deepObject;
            for (let i = 0; i < 12; i++) {
                current['next'] = {};
                current = current['next'];
            }
            mockEvaluateAllAndGetSummary.mockResolvedValue(deepObject);
            const result = await InterfaceHealthChecker.performHealthCheck(mockContext, mockConfig);
            expect(JSON.stringify(result)).toContain('[Max Depth Reached]');
        });
    });
});
