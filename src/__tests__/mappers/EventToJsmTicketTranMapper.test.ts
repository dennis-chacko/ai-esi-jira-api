import { ESILogger } from "esi-common-layer";
import { EventToJsmTicketTranMapper } from '../../mappers/EventToJsmTicketTranMapper';
import 'jest';
import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';

describe('mapToTarget', () => {
    let mockLogger: any;

    beforeEach(() => {
        mockLogger = {
            debug: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn()
        };
        ESILogger.getLogger = jest.fn().mockReturnValue(mockLogger) as any;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should map event to JsmTicket', () => {
        const mapper = new EventToJsmTicketTranMapper(ESILogger.LogLevels.INFO);
        const event = {
            
        };

        const result = mapper.mapToTarget(event);
        // expect(result).toEqual({
        //     // expected JsmTicket properties
        // });
    });

    it('should handle invalid JSON in event body', () => {
        const mapper = new EventToJsmTicketTranMapper(ESILogger.LogLevels.INFO);
        const event = {
            body: 'invalid-json'
        };

        expect(() => {
            mapper.mapToTarget(event);
        }).toThrow();
        expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle missing event body', () => {
        const mapper = new EventToJsmTicketTranMapper(ESILogger.LogLevels.INFO);
        const event = {};

        expect(() => {
            mapper.mapToTarget(event);
        }).toThrow();
        expect(mockLogger.error).toHaveBeenCalled();
    });
});
