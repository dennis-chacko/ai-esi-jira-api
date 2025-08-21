import { IDocFilter } from './sams_common/interfaces/IDocFilter';
import { IDocFilterResult } from './sams_common/interfaces/IDocFilterResult';
import { JsmTicket } from './models/JsmTicket';
import { ESILogger } from 'esi-common-layer';

const logger = ESILogger.getLogger('ItsmTicketFilter');
const ItsmTicketFilterTransactionType = 'ItsmTicketFilter';

export class ItsmTicketFilter implements IDocFilter<JsmTicket> {

    // TODO: DEVELOPERS: Update the name of the filter or implementation
    // This name will be used to filter out the documents/transactions that are not needed
    public readonly name: string = 'ItsmTicketFilter';

    public test(doc: JsmTicket): IDocFilterResult {
        logger.info(`Testing transaction type: ${doc.TransactionType}`);

        const isItsmTicketFilter = doc.TransactionType === ItsmTicketFilterTransactionType;
        
        return {
            isValid: isItsmTicketFilter,
            message: isItsmTicketFilter 
            ? `Processing record with Transaction Type = ${ ItsmTicketFilterTransactionType }`
            : `Ignoring record with Transaction Type = "${doc.TransactionType}"`
        };
    }
}