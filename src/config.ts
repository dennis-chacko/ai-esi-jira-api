import { ESIAuthTokenProvider, ESICustomError, ESIEnvironments, ESILogger, ESIParameterStoreService } from "esi-common-layer";
import * as dotenv from "dotenv";

dotenv.config();

export class Config {
  public logLevel: ESILogger.LogLevels;
  public esiOAuthSecretName: string;
  public esiAuthToken: string;
  public samsAPIURL: string;
  public esiEnvironment: ESIEnvironments;
  public producerInterfaceKey: string;
  private parameterStore: ESIParameterStoreService;
  private samsHostParam: string;
  private errors: string[];

  constructor() {
    const region = this._getEnv('AWS_REGION', 'us-east-2');
    this.logLevel = this._getEnv('LOG_LEVEL', ESILogger.LogLevels.INFO) as ESILogger.LogLevels;
    this.producerInterfaceKey = this._getEnv('PRODUCER_INTERFACE_KEY', 'jsm_ticket_producer');
    this.esiOAuthSecretName = this._getEnv('ESI_OAUTH_SECRET_NAME', 'esi/interface/jsm/oauth');
    this.samsHostParam = this._getEnv('SAMS_HOST_PARAM', '/esi/interface/common/sams_host');
    this.parameterStore = new ESIParameterStoreService(region, this.logLevel);
    this.errors = [];
  }

  public static async createInstance(run: { throwError: boolean }): Promise<Config> {
    const config = new Config();
    await config._loadConfig(run);
    return config;
  }

  private async _loadConfig(run: { throwError: boolean }) {
    const missingVars: string[] = [];

    this.esiEnvironment = this._getEnv('ESI_ENVIRONMENT', "dev", missingVars) as ESIEnvironments;
    if (missingVars.length > 0) {
      const error = new ESICustomError(`Missing required environment variables: ${missingVars.join(', ')}`);
      this.errors.push(error.message);
      if (run.throwError) {
        throw error;
      }
    }

    this.esiAuthToken = await ESIAuthTokenProvider.getToken(this.esiOAuthSecretName);
    if (!this.esiAuthToken) {
      this.errors.push(`Failed to get ESI Auth Token from secret: ${this.esiOAuthSecretName}`);
    }
    const logger = ESILogger.getLogger('Config');
    logger.info(`Config initialized successfully within ESI_ENVIRONMENT: ${this.esiEnvironment}`);
    this.samsAPIURL = await this._getParameterStoreValue(this.samsHostParam, run.throwError);
  }

  private _getEnv(key: string, defaultValue?: string, missingVars?: string[]): string {
    const value = process.env[key] || defaultValue;
    if (value === undefined && missingVars) {
      missingVars.push(key);
    }
    return value;
  }

  public async loadConfigWithoutErrorThrow(): Promise<{ errors: string[] }> {
    await this._loadConfig({ throwError: false });
    this._maskConfigSensitiveValues();
    return { errors: this.errors.length > 0 ? this.errors : null };
  }

  private _maskConfigSensitiveValues() {
    this.esiAuthToken = '[REDACTED]';
    this.parameterStore = null;
  }

  private async _getParameterStoreValue(paramName: string, throwError: boolean): Promise<string> {
    try {
      return await this.parameterStore.getValue(paramName);
    } catch (error) {
      const customError = new ESICustomError(`Failed to retrieve ${paramName} value from parameter store: ${error.message}`);
      this.errors.push(customError.message);
      if (throwError) {
        throw customError;
      }
      return '';
    }
  }
}