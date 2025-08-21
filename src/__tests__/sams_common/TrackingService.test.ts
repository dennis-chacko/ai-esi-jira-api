import { TrackingService } from '../../sams_common/trackingService';
import { ESIEnvironments, ESILogger, ESITrackingServiceDocument } from 'esi-common-layer';

jest.mock('esi-common-layer', () => {
    return {
        ...jest.requireActual('esi-common-layer'),
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
            DocumentService: jest.fn().mockImplementation(() => ({
                create: jest.fn().mockResolvedValue({ key: 'docKeyXYZ' }),
                createStep: jest.fn().mockResolvedValue({}),
                update: jest.fn().mockResolvedValue({})
            }))
        }
    }
});

const MockLogger = ESILogger.getLogger('TrackingServiceTest', ESILogger.LogLevels.INFO);
const mockDocService = new ESITrackingServiceDocument.DocumentService(
    {env: 'test' as ESIEnvironments, accessToken:'token'}, 
    'interfaceKey',
    true,
    ESILogger.LogLevels.INFO
);

describe('TrackingService', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('createInstance throws error if esiAuthToken is missing', () => {
        expect(() =>
            TrackingService.createInstance('', 'interfaceKey', ESILogger.LogLevels.INFO, 'test' as ESIEnvironments)
        ).toThrow('[createTrackingService] Required parameter missing: esiAuthToken');
    });

    test('createInstance throws error if interfaceKey is missing', () => {
        expect(() =>
            TrackingService.createInstance('token', '', ESILogger.LogLevels.INFO, 'test' as ESIEnvironments)
        ).toThrow('[createTrackingService] Required parameter missing: interfaceKey');
    });

    test('createInstance creates a new instance', async () => {
        const service = TrackingService.createInstance('token', 'ifaceKey', ESILogger.LogLevels.INFO, 'test' as ESIEnvironments);
        expect(service).toBeInstanceOf(TrackingService);
    });

    test('constructor throws error if interfaceKey is missing', () => {
        expect(() => new TrackingService('', ESILogger.LogLevels.INFO, mockDocService)).toThrow('[trackingService] Required parameter missing: interfaceKey');
    });

    test('constructor throws error if documentService is missing', () => {
        expect(() => new TrackingService('interfaceKey', ESILogger.LogLevels.INFO, null as unknown as ESITrackingServiceDocument.DocumentService))
            .toThrow('[trackingService] Required parameter missing: documentService');
    });

    test('createDoc sets documentKey', async () => {
        const service = new TrackingService('interfaceKey', ESILogger.LogLevels.INFO, mockDocService);
        const docKey = await service.createDoc('businessId123', 'someProcess');
        expect(docKey).toBe('docKeyXYZ');
        expect(service.documentKey).toBe('docKeyXYZ');
        expect(MockLogger.info).toHaveBeenCalledWith(expect.stringContaining('Tracking Document docKeyXYZ created'));
    });

    test('createDoc logs and rethrows error on failure', async () => {
        const failingDocService = {
            create: jest.fn().mockRejectedValue(new Error('Create error'))
        } as unknown as ESITrackingServiceDocument.DocumentService;

        const service = new TrackingService('interfaceKey', ESILogger.LogLevels.INFO, failingDocService);
        await expect(service.createDoc('bizId')).rejects.toThrow('Create error');
        expect(MockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Error creating tracking document'));
    });

    test('createDocStep creates step successfully', async () => {
        const service = new TrackingService('interfaceKey', ESILogger.LogLevels.INFO, mockDocService);
        service.documentKey = 'docKeyXYZ';
        await service.createDocStep('process', ESITrackingServiceDocument.StepStatus.COMPLETED, 'no error');
        expect(mockDocService.createStep).toHaveBeenCalledWith(
            expect.objectContaining({ process: 'process', status: 'COMPLETED', error_message: 'no error' }),
            'docKeyXYZ'
        );
    });

    test('createDocStep logs error if step creation fails', async () => {
        const failingDocService = {
            createStep: jest.fn().mockRejectedValue(new Error('Step error'))
        } as unknown as ESITrackingServiceDocument.DocumentService;

        const service = new TrackingService('interfaceKey', ESILogger.LogLevels.INFO, failingDocService);
        service.documentKey = 'docKeyXYZ';
        await service.createDocStep('process', ESITrackingServiceDocument.StepStatus.COMPLETED, 'message');
        expect(MockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Error creating document step'));
    });

    test('updateDocStatus updates doc status successfully', async () => {
        const service = new TrackingService('interfaceKey', ESILogger.LogLevels.INFO, mockDocService);
        service.documentKey = 'docKeyXYZ';
        await service.updateDocStatus(ESITrackingServiceDocument.DocumentStatus.COMPLETED, 'no error');
        expect(mockDocService.update).toHaveBeenCalledWith(
            expect.objectContaining({ status: 'COMPLETED', error_message: 'no error' }),
            true
        );
    });

    test('updateDocStatus logs error if update fails', async () => {
        const failingDocService = {
            update: jest.fn().mockRejectedValue(new Error('Update error'))
        } as unknown as ESITrackingServiceDocument.DocumentService;

        const service = new TrackingService('interfaceKey', ESILogger.LogLevels.INFO, failingDocService);
        service.documentKey = 'docKeyXYZ';
        await service.updateDocStatus(ESITrackingServiceDocument.DocumentStatus.FAILED, 'error msg');
        expect(MockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Error updating document status'));
    });

    test('createDocStep logs error if documentKey is undefined', async () => {
        const service = new TrackingService('interfaceKey', ESILogger.LogLevels.INFO, mockDocService);
        service.documentKey = undefined;
        await service.createDocStep('process', ESITrackingServiceDocument.StepStatus.COMPLETED);
        expect(MockLogger.error).toHaveBeenCalledWith(
            'Error creating document step for undefined for process [process]: {}'
        );
    });

    test('updateDocStatus logs error if documentKey is undefined', async () => {
        const service = new TrackingService('interfaceKey', ESILogger.LogLevels.INFO, mockDocService);
        service.documentKey = undefined;
        await service.updateDocStatus(ESITrackingServiceDocument.DocumentStatus.COMPLETED);
        expect(MockLogger.error).toHaveBeenCalledWith(
            'Error updating document status for undefined: {}'
        );
    });
});
