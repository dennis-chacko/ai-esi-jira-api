import { ItsmTIcket } from "../models/ItsmTIcket";
import { IMapper } from "../sams_common/interfaces/IMapper";
import { JsmTicket } from "../models/JsmTicket";

export class JsmTicketToItsmTicketMapper implements IMapper<JsmTicket, ItsmTIcket> {
    
    // TODO: DEVELOPERS: Implement the mapping logic
    // This is where you will map the source model to the ESI model
    // Remove any unneeded or unused code
    constructor() {
       
    }

    public async mapToTarget(sourceModel: JsmTicket): Promise<ItsmTIcket[]> {
        const esiModel = new ItsmTIcket();

        return [esiModel];
    }
}