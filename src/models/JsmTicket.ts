import { IDocument } from "../sams_common/interfaces/IDocument";

export class JsmTicket implements IDocument {
    public readonly TransactionType: string;

    // TODO - DEVELOPERS: Add other properties that are necessary to the source model
    getJson(): any {
        return { ...this };
    }
}