import { ESIAPIHelper, ESILogger } from 'esi-common-layer';


interface DedupeResponse {
  statusCode?: number;
  headers?: { [key: string]: string };
  error?: string;
  data?: any;
}

export class DedupeService {
  private static readonly headers = {
    'Content-Type': 'application/json',
    'Accept': '*/*',
  };

  private webApiHelper: ESIAPIHelper.WebApiHelper;

  constructor(
    private readonly authToken: string,
    private readonly dedupeUrl: string,
    private readonly interfaceKey: string,
    private logger: any = ESILogger.getLogger('DedupeService', ESILogger.LogLevels.INFO)
  ) {
    this.webApiHelper = new ESIAPIHelper.WebApiHelper();
  }

  private getAuthHeaders() {
    return {
      ...DedupeService.headers,
      'Authorization': `Bearer ${this.authToken}`,
    };
  }

  // Fetch de-dupe data from cache
  public async get(dedupeId: string): Promise<DedupeResponse> {
    try {
      const response = await this.webApiHelper.sendRequest(
        'GET',
        `${this.dedupeUrl}/${this.interfaceKey}/${dedupeId}`,
        {},
        { headers: this.getAuthHeaders() }
      );
      return { data: response };
    } catch (e: any) {
      return {
        statusCode: e.response?.status || 500,
        headers: { "Content-Type": "application/json" },
        error: e.message
      };
    }
  }

  // Insert de-dupe ID into cache
  public async post(dedupeId: string, timeToLive: number): Promise<DedupeResponse> {
    try {
      const response = await this.webApiHelper.sendRequest(
        'POST',
        `${this.dedupeUrl}/${this.interfaceKey}/${dedupeId}`,
        { time_to_live_minutes: timeToLive },
        { headers: this.getAuthHeaders() }
      );
      return { data: response };
    } catch (e: any) {
      return {
        statusCode: e.response?.status || 500,
        headers: { "Content-Type": "application/json" },
        error: e.message
      };
    }
  }

  // Delete de-dupe ID from cache
  public async delete(dedupeId: string): Promise<DedupeResponse | void> {
    try {
      const response = await this.webApiHelper.sendRequest(
        'DELETE',
        `${this.dedupeUrl}/${this.interfaceKey}/${dedupeId}`,
        {},
        { headers: this.getAuthHeaders() }
      );
      return { data: response };
    } catch (e: any) {
      this.logger.error(`Error: ${e.message}`);
    }
  }
}