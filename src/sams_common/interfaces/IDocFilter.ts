import { IDocFilterResult } from './IDocFilterResult';

/**
 * A filter test to determine if a document should be processed.
 */
export interface IDocFilter<DocType> {
    name: string;
    test(doc: DocType): IDocFilterResult;
}
