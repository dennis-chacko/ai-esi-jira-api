export interface IPostResponse {
    status?: number;
    wasPosted: boolean;
    response?: string;
    errorMessage?: string;
}