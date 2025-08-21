import { IPostResponse } from "./IPostResponse";

export interface IPostToTarget<TargetDocType> {
    postToTarget(doc: TargetDocType): Promise<IPostResponse | IPostResponse[]>;
}