import { ValidationError } from 'esi-common-layer';

export class StringUtils {

    public static getProperty(eventBody: any, propertyName: string, isRequired: boolean): string {
        if (!eventBody[propertyName] && isRequired) {
            throw new ValidationError(`Missing event property: ${propertyName}`);
        }
        return eventBody[propertyName];
    }

    public static getDateProperty(eventBody: any, propertyName: string, isRequired: boolean): Date {
        const dateStr = this.getProperty(eventBody, propertyName, isRequired);
        try {
            const date = new Date(dateStr);
            return date;
        } catch (error) {
            throw new ValidationError(`Invalid date format for property: ${propertyName}`);
        }
    }

    public static getIntProperty(eventBody: any, propertyName: string, isRequired: boolean): number {
        const numStr = this.getProperty(eventBody, propertyName, isRequired);
        try {
            const result = parseInt(numStr);
            return result;
        } catch (error) {
            throw new ValidationError(`Invalid integer format for property: ${propertyName}`);
        }
    }

    public static getNumProperty(eventBody: any, propertyName: string, isRequired: boolean): number {
        const numStr = this.getProperty(eventBody, propertyName, isRequired);
        try {
            const result = parseFloat(numStr);
            return result;
        }
        catch (error) {
            throw new ValidationError(`Invalid number format for property: ${propertyName}`);
        }   
    }

}