import { ItsmTicketFilter } from '../ItsmTicketFilter';
import { JsmTicket } from '../models/JsmTicket';

describe('ItsmTicketFilter', () => {
    let filter: ItsmTicketFilter;

    beforeEach(() => {
        filter = new ItsmTicketFilter();
    });

    it('should have the correct name', () => {
        expect(filter.name).toBe('ItsmTicketFilter');
    });

    describe('test method', () => {
        it('should return valid result for ItsmTicketFilter transaction type', () => {
            const transaction: JsmTicket = {
                TransactionType: 'ItsmTicketFilter'
            } as JsmTicket;

            const result = filter.test(transaction);

            expect(result.isValid).toBe(true);
            expect(result.message).toBe('Processing record with Transaction Type = "ItsmTicketFilter"');
        });

        it('should return invalid result for non-ItsmTicketFilter transaction type', () => {
            const transaction: JsmTicket = {
                TransactionType: 'SALE'
            } as JsmTicket;

            const result = filter.test(transaction);

            expect(result.isValid).toBe(false);
            expect(result.message).toBe('Ignoring record with Transaction Type = "SALE"');
        });
    });
});
