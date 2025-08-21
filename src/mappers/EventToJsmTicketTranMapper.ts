import { ESILogger, ValidationError } from "esi-common-layer";
import { JsmTicket } from "../models/JsmTicket";
import { XMLParser } from 'fast-xml-parser';
import { IMapper } from "../sams_common/interfaces/IMapper";

const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@@',
    parseAttributeValue: true
});

export class EventToJsmTicketTranMapper implements IMapper<any, JsmTicket> {
    private readonly logger = ESILogger.getLogger('EventToJsmTicketTranMapper');
    private errorMessage: string;


    // TODO: DEVELOPERS: Update the constructor and the mapToTarget to
    // transform the event to the source model
    // This is where you will map the event to the source model
    // Remove any unneeded or unused code
    constructor(logLevel: ESILogger.LogLevels) {
        this.logger = ESILogger.getLogger('EventToJsmTicketTranMapper', logLevel);
    }

    public async mapToTarget(event: any): Promise<JsmTicket[]> {
        if (!event?.body) {
            this.errorMessage = 'Missing Event body.';
            this._throwValidationError(this.errorMessage);
        }

        if (!event?.headers?.['Document-Key']) {
            this._throwValidationError('Missing required document key in event headers');
        }
        if (!event?.headers?.['Native-Business-Id']) {
            this._throwValidationError('Missing required native business id in event headers');
        }

        let body: any;
        try {
            body = JSON.parse(event.body);
        } catch (jsonErr) {
            this.errorMessage = 'Failed to parse JSON' + (jsonErr ? ` ${jsonErr}` : '');
            this._throwValidationError(this.errorMessage);
        }

        let payloadString = body?.payload; 
        if (!payloadString) {
            this._throwValidationError("No 'payload' property found in the event body JSON.");
        }

        let decodedXml: string;
        if (this._looksLikeBase64(payloadString)) {
            try {
                decodedXml = Buffer.from(payloadString, 'base64').toString('utf-8');
            } catch (decodeError) {
                this.errorMessage = 'Failed to decode base64 data' + (decodeError ? ` ${decodeError}` : '');
                this._throwValidationError(this.errorMessage);
            }
        } else {
            decodedXml = payloadString;
        }

        let parsedData;
        try {
            parsedData = parser.parse(decodedXml);
            this.logger.debug(`Parsed data: ${JSON.stringify(parsedData)}`);
        } catch (parseError) {
            this.errorMessage = 'Failed to parse XML data' + (parseError ? ` ${parseError}` : '');
            this._throwValidationError(this.errorMessage);
        }

        if (!parsedData?.POSLog?.Transaction) {
            this.errorMessage = 'Invalid event - Missing required transaction data';
            this._throwValidationError(this.errorMessage);
        }

        const transaction = parsedData

        this._logTransaction(transaction);

        return [transaction];
    }

    private _looksLikeBase64(str: string): boolean {
        if (typeof str !== 'string') return false;
        // Check if string matches base64 pattern (including padding)
        return /^[A-Za-z0-9+/]+={0,2}$/.test(str);
    }

   
    private _throwValidationError(message: string, data?: string): never {
        this.logger.error(message + (data ? ` ${data}` : ''));
        const error = new ValidationError('Validation Failed: ' + message);
        error.message = message;
        throw error;
    }

    private _logTransaction(transaction: any): void {
        const sanitizedTransaction = JSON.parse(JSON.stringify(transaction));
        this.logger.debug(`Received transaction: ${JSON.stringify(sanitizedTransaction)}`);
    }

    public _validateDateFormat(name: string, value: any, isRequired: boolean) {
        if (!value) {
            if (isRequired) {
                this._throwValidationError(`${name} is required`);
            }
            return;
        }
        if (!this._isValidFormattedDate(value)) {
            const errorMessage = `Invalid format for ${name} (${value}).  Expecting YYYY-MM-DD [hh:mm:ss.s]`;
            this._throwValidationError(errorMessage);
        }
    }

    private _isValidDate(value): boolean {
        const dateStr: string = value?.toString();
        const date = new Date(dateStr);
        return !isNaN(date.getTime());
    }
    
    private _isValidFormattedDate(dateString: string): boolean {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        const dateTimeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/;
        return (dateRegex.test(dateString) || dateTimeRegex.test(dateString)) && this._isValidDate(dateString);
    }    
}
