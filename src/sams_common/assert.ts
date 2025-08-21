export class Assert {
    public static isDefined(name: string, value: any): void {
        if (value === undefined) {
            throw new Error(`Missing required parameter: ${name}`);
        }
    }
}