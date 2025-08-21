/**
 * Test result from running a filter test
 * @param isValid - [true] if the document passed the test, [false] if document should not be processed.
 * @param message - Optional message to include in the doc step message if the test fails.
 */
export interface IDocFilterResult {
    isValid: boolean;
    message?: string
}