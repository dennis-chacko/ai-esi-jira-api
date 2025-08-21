import { 
    ESIAuthTokenProvider, 
    ESILogger, 
    ESIEnvironments 
} from 'esi-common-layer';

import { SamsProducerInterface } from '../../sams_common/samsProducerInterface';
import { TrackingService } from '../../sams_common/trackingService';
import { ISamsDocument } from '../../sams_common/interfaces/ISamsDocument';
import { IMapper } from '../../sams_common/interfaces/IMapper';

jest.mock('../../sams_common/trackingService', () => {
  class MockTrackingService {
    public documentKey = 'mock-doc-key';
    public createDoc = jest.fn().mockResolvedValue('mock-doc-key');
    public createDocStep = jest.fn().mockResolvedValue(undefined);
    public updateDocStatus = jest.fn().mockResolvedValue(undefined);

    public static createInstance(
      esiAuthToken: string,
      interfaceKey: string,
      logLevel: ESILogger.LogLevels,
      env: ESIEnvironments
    ): MockTrackingService {
      return new MockTrackingService();
    }
  }
  return {
    TrackingService: MockTrackingService
  };
});

// Mocks for ESIAuthTokenProvider, ESIAPIHelper, etc:
jest.mock('esi-common-layer', () => {
    const original = jest.requireActual('esi-common-layer');
    return {
        ...original,
        ESIAuthTokenProvider: {
            getToken: jest.fn()
        },
        ESIAPIHelper: {
            WebApiHelper: jest.fn().mockImplementation((logLevel: any) => {
                return {
                    sendRequest: jest.fn()
                };
            })
        },
        ESILogger: {
            LogLevels: {
                ERROR: 'ERROR',
                INFO: 'INFO'
            },
            getLogger: jest.fn().mockReturnValue({
                info: jest.fn(),
                warn: jest.fn(),
                error: jest.fn()
            })
        },
        ESITrackingServiceDocument: {
            DocumentStatus: {
                PROCESSING: 'PROCESSING',
                COMPLETED: 'COMPLETED',
                FAILED: 'FAILED'
            },
            StepStatus: {
                COMPLETED: 'COMPLETED',
                FAILED: 'FAILED'
            },
            DocumentService: jest.fn()
        }
    };
});

jest.mock('../../sams_common/assert', () => {
    return {
        Assert: {
            isDefined: jest.fn((name: string, value: any) => {
                if (value === undefined || value === null) {
                    if (name === 'sourceDoc') {
                        throw new Error('[processDocument] Missing required parameter: sourceDoc');
                    }
                    throw new Error(`${name} must be defined`);
                }
            })
        }
    };
});

jest.mock('../../sams_common/trackingService', () => {
    return {
        TrackingService: {
            createInstance: jest.fn().mockReturnValue({
                documentKey: 'mock-doc-key',
                createDoc: jest.fn().mockResolvedValue('mock-doc-key'),
                createDocStep: jest.fn().mockResolvedValue(undefined),
                updateDocStatus: jest.fn().mockResolvedValue(undefined),
            }),
        }
    };
});

// Test Interfaces and Mapper
interface TestSourceDoc {
    sourceField: string;
}
interface TestTargetDoc extends ISamsDocument {
    targetField: string;
}

class TestMapper implements IMapper<TestSourceDoc, TestTargetDoc> {
    async mapToTarget(sourceDoc: TestSourceDoc): Promise<TestTargetDoc[]> {
        return [{
            nativeBusinessId: 'test-native-biz-id',
            documentKey: 'test-doc-key',
            getJson: (mask: boolean) => mask ? JSON.stringify({ masked: true }) : JSON.stringify({ masked: false }),
            targetField: sourceDoc.sourceField
        }];
    }
}

describe('SamsProducerInterface', () => {
    let mockGetToken: jest.Mock;
    let mockCreateInstance: jest.Mock;
    let mockWebApi: any;
    let mockLogger: any;

    const esiOAuthSecretName = 'test-secret';
    const logLevel = ESILogger.LogLevels.INFO;
    const samsUrl = 'http://test-sams-url';
    const interfaceKey = 'test-interface-key';
    const env = ESIEnvironments.TEST;
    let mapper: IMapper<TestSourceDoc, TestTargetDoc>;

    beforeEach(() => {
        jest.clearAllMocks();
        mapper = new TestMapper();

        mockGetToken = (ESIAuthTokenProvider.getToken as jest.Mock);
        mockGetToken.mockResolvedValue('test-token');

        mockCreateInstance = (TrackingService.createInstance as jest.Mock);
        mockCreateInstance.mockReturnValue({
            createDoc: jest.fn().mockResolvedValue('mock-doc-key'),
            createDocStep: jest.fn().mockResolvedValue(undefined),
            updateDocStatus: jest.fn().mockResolvedValue(undefined),
            documentKey: 'mock-doc-key'
        });

        // Create a new mock function for sendRequest
        const sendRequestMock = jest.fn();
        
        // Set up the default successful response
        sendRequestMock.mockResolvedValue({
            status: 200,
            data: { success: true }
        });

        mockWebApi = {
            sendRequest: sendRequestMock
        };

        const { ESILogger } = require('esi-common-layer');
        mockLogger = ESILogger.getLogger();

        // Mock the ESIAPIHelper.WebApiHelper to return our mockWebApi
        const { ESIAPIHelper } = require('esi-common-layer');
        (ESIAPIHelper.WebApiHelper as jest.Mock).mockImplementation(() => mockWebApi);
    });

    describe('createInstance', () => {
        it('should create instance successfully', async () => {
            const instance = await SamsProducerInterface.createInstance(
                esiOAuthSecretName,
                logLevel,
                samsUrl,
                interfaceKey,
                env,
                mapper
            );

            expect(instance).toBeInstanceOf(SamsProducerInterface);
            expect(mockGetToken).toHaveBeenCalledWith(esiOAuthSecretName);
            expect(mockCreateInstance).toHaveBeenCalledWith('test-token', interfaceKey, logLevel, env);
        });

        it('should fail if esiOAuthSecretName is not defined', async () => {
            await expect(SamsProducerInterface.createInstance(
                undefined as any,
                logLevel,
                samsUrl,
                interfaceKey,
                env,
                mapper
            )).rejects.toThrow('esiOAuthSecretName must be defined');
        });

        it('should fail if token is not retrieved', async () => {
            mockGetToken.mockResolvedValueOnce(null);
            await expect(SamsProducerInterface.createInstance(
                esiOAuthSecretName,
                logLevel,
                samsUrl,
                interfaceKey,
                env,
                mapper
            )).rejects.toThrow('Failed to get ESI Auth Token from secret: test-secret');
        });
    });

    describe('constructor', () => {
        it('should throw if arguments are missing', () => {
            expect(() => new SamsProducerInterface(
                null as any,
                mapper,
                interfaceKey,
                { } as TrackingService,
                samsUrl,
                'test-token',
                mockWebApi
            )).toThrow('logLevel must be defined');

            expect(() => new SamsProducerInterface(
                logLevel,
                null as any,
                interfaceKey,
                { } as TrackingService,
                samsUrl,
                'test-token',
                mockWebApi
            )).toThrow('mapper must be defined');

            expect(() => new SamsProducerInterface(
                logLevel,
                mapper,
                null as any,
                { } as TrackingService,
                samsUrl,
                'test-token',
                mockWebApi
            )).toThrow('interfaceKey must be defined');

            expect(() => new SamsProducerInterface(
                logLevel,
                mapper,
                interfaceKey,
                null as any,
                samsUrl,
                'test-token',
                mockWebApi
            )).toThrow('trackingService must be defined');

            expect(() => new SamsProducerInterface(
                logLevel,
                mapper,
                interfaceKey,
                {} as TrackingService,
                null as any,
                'test-token',
                mockWebApi
            )).toThrow('samsUrl must be defined');

            expect(() => new SamsProducerInterface(
                logLevel,
                mapper,
                interfaceKey,
                {} as TrackingService,
                samsUrl,
                null as any,
                mockWebApi
            )).toThrow('esiAuthToken must be defined');

            expect(() => new SamsProducerInterface(
                logLevel,
                mapper,
                interfaceKey,
                {} as TrackingService,
                samsUrl,
                'test-token',
                null as any
            )).toThrow('webApi must be defined');
        });
    });

    describe('processDocument', () => {
        let instance: SamsProducerInterface<TestSourceDoc, TestTargetDoc>;
        let mockTrackingService: any;

        beforeEach(async () => {
            // Create a fresh tracking service mock for each test
            mockTrackingService = {
                createDoc: jest.fn().mockResolvedValue('mock-doc-key'),
                createDocStep: jest.fn().mockResolvedValue(undefined),
                updateDocStatus: jest.fn().mockResolvedValue(undefined),
                documentKey: 'mock-doc-key'
            };

            // Update the TrackingService.createInstance mock
            (TrackingService.createInstance as jest.Mock).mockReturnValue(mockTrackingService);

            instance = await SamsProducerInterface.createInstance(
                esiOAuthSecretName,
                logLevel,
                samsUrl,
                interfaceKey,
                env,
                mapper
            );
        });

        it('should throw if sourceDoc is not defined', async () => {
            await expect(instance.processDocument(null as any))
                .rejects.toThrow('[processDocument] Missing required parameter: sourceDoc');
        });

        it('should map and publish documents successfully', async () => {
            const sourceDoc: TestSourceDoc = { sourceField: 'test-value' };
            
            // Create the instance after setting up the mock
            instance = await SamsProducerInterface.createInstance(
                esiOAuthSecretName,
                logLevel,
                samsUrl,
                interfaceKey,
                env,
                mapper
            );

            (mockWebApi.sendRequest as jest.Mock).mockResolvedValue({ status: 200, data: {} });

            const result = await instance.processDocument(sourceDoc);
            
            expect(result).toHaveLength(1);
            expect(result[0].wasPosted).toBe(true);
            expect(result[0].errorMessage).toBeNull();
            expect(result[0].documentKey).toBe('mock-doc-key');
            expect(result[0].nativeBusinessId).toBe('test-native-biz-id');

            // Verify tracking service calls
            expect(mockTrackingService.createDoc).toHaveBeenCalledWith('test-native-biz-id');
            expect(mockTrackingService.createDocStep).toHaveBeenCalledWith('Post doc to SAMS', 'COMPLETED');
            expect(mockTrackingService.updateDocStatus).toHaveBeenCalledWith('COMPLETED');
        });
    });

    describe('publish', () => {
        let instance: SamsProducerInterface<TestSourceDoc, TestTargetDoc>;
        let doc: TestTargetDoc;
        let mockTrackingService: any;

        beforeEach(async () => {
            // Create a fresh tracking service mock for each test
            mockTrackingService = {
                createDoc: jest.fn().mockResolvedValue('mock-doc-key'),
                createDocStep: jest.fn().mockResolvedValue(undefined),
                updateDocStatus: jest.fn().mockResolvedValue(undefined),
                documentKey: 'mock-doc-key'
            };

            // Update the TrackingService.createInstance mock
            (TrackingService.createInstance as jest.Mock).mockReturnValue(mockTrackingService);

            instance = await SamsProducerInterface.createInstance(
                esiOAuthSecretName,
                logLevel,
                samsUrl,
                interfaceKey,
                env,
                mapper
            );
            
            doc = {
                nativeBusinessId: 'test-native-biz-id',
                documentKey: '',
                getJson: (mask: boolean) => mask ? '{"masked":true}' : '{"masked":false}',
                targetField: 'test-field'
            };
        });

        it('should handle successful publish', async () => {
            (mockWebApi.sendRequest as jest.Mock).mockResolvedValue({ status: 200, data: {} });

            const response = await instance.publish(doc);
            expect(response.wasPosted).toBe(true);
            expect(response.errorMessage).toBeNull();
            expect(response.documentKey).toBe('mock-doc-key');
            expect(response.nativeBusinessId).toBe('test-native-biz-id');
        });

        it('should handle non-2xx response', async () => {
            mockWebApi.sendRequest.mockResolvedValueOnce({
                status: 400,
                data: { error: 'Bad Request' },
                response: { status: 400 }
            });
            const response = await instance.publish(doc);
            expect(response.wasPosted).toBe(false);
            expect(response.errorMessage).toContain('Status code: 400');
        });

        it('should handle thrown error with response', async () => {
            const error = new Error('Request failed');
            (error as any).response = { status: 500 };
            mockWebApi.sendRequest.mockRejectedValueOnce(error);
            const response = await instance.publish(doc);
            expect(response.wasPosted).toBe(false);
            expect(response.errorMessage).toContain('Status: 500  Request failed');
        });

        it('should handle thrown error without response', async () => {
            const error = new Error('Generic error');
            mockWebApi.sendRequest.mockRejectedValueOnce(error);
            const response = await instance.publish(doc);
            expect(response.wasPosted).toBe(false);
            expect(response.errorMessage).toContain('Generic error');
        });
    });

    describe('postToSams (private method)', () => {
        let instance: SamsProducerInterface<TestSourceDoc, TestTargetDoc>;
        let doc: TestTargetDoc;

        beforeEach(async () => {
            instance = await SamsProducerInterface.createInstance(
                esiOAuthSecretName,
                logLevel,
                samsUrl,
                interfaceKey,
                env,
                mapper
            );
            doc = {
                nativeBusinessId: 'test-native-biz-id',
                documentKey: '',
                getJson: (mask: boolean) => mask ? '{"masked":true}' : '{"masked":false}',
                targetField: 'test-field'
            };
        });

        it('should send request with correct headers and body', async () => {
            const expectedHeaders = {
                'Content-Type': 'application/json',
                'Accept': '*/*',
                'Authorization': 'Bearer test-token',
                'Interface-key': interfaceKey,
                'Native-Business-Id': 'test-native-biz-id',
                'Document-Key': 'mock-doc-key'
            };

            mockWebApi.sendRequest.mockResolvedValueOnce({
                status: 200,
                data: {}
            });

            await instance.publish(doc);

            expect(mockWebApi.sendRequest).toHaveBeenCalledWith(
                'POST',
                samsUrl,
                '{"masked":false}',
                { headers: expectedHeaders }
            );
        });

        it('should throw error if status > 300', async () => {
            mockWebApi.sendRequest.mockResolvedValueOnce({
                status: 404,
                data: { message: 'Not found' },
                response: { status: 404 }
            });
            const response = await instance.publish(doc);
            expect(response.wasPosted).toBe(false);
            expect(response.errorMessage).toContain('Status code: 404');
        });
    });
});
