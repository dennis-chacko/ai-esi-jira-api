import { JsmTicketToItsmTicketMapper } from '../../mappers/JsmTicketToItsmTicketMapper';
import { JsmTicket } from '../../models/JsmTicket';
import { ItsmTIcket } from '../../models/ItsmTIcket';

describe('JsmTicketToItsmTicketMapper', () => {
    let mapper: JsmTicketToItsmTicketMapper;
    let mockTransaction: JsmTicket;
    
    beforeEach(() => {
        mapper = new JsmTicketToItsmTicketMapper();
        mockTransaction = {
            TransactionType: 'ItsmTicketFilter',
            getJson() {
                return { ...this };
            },
        }
    });

    describe('mapToTarget', () => {
        it('should map JsmTicket to ItsmTIcket', () => {
            const result = mapper.mapToTarget(mockTransaction);

        });

        it('should handle missing transaction ID', () => {

            const result = mapper.mapToTarget(mockTransaction);

            expect(result).toBeDefined();
        });

        it('should handle missing items array', () => {

            const result = mapper.mapToTarget(mockTransaction);

            expect(result).toEqual([]);
        });
    });
});
