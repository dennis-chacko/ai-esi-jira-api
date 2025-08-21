export interface IDocument {
    getJson(hideSensitiveData: boolean): string;
    errorMessage?: string;
    getNativeBusinessId?(): string;
}