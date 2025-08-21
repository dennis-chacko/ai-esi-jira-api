import { IDocument } from "./IDocument";

export interface ISamsDocument extends IDocument {
    documentKey: string;
    nativeBusinessId: string;
}