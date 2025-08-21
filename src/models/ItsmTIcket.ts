import { ISamsDocument } from "../sams_common/interfaces/ISamsDocument";

export class ItsmTIcket implements ISamsDocument {
    documentKey: string;
    nativeBusinessId: string;

    // TODO - DEVELOPERS: Add other properties that are necessary to the ESI model

    public getJson(hideSensitiveData: boolean): string {
        return JSON.stringify(this);
    }
}