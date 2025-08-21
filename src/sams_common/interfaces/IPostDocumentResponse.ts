import { IPostResponse } from "./IPostResponse";

export interface IPostDocumentResponse extends IPostResponse{
    interfaceKey?: string,
    documentKey: string,
    nativeBusinessId: string,
    message?: string,
}