import { ESITrackingServiceDocument, ESIAuthTokenProvider, ESIAPIHelper, ESILogger, ESIEnvironments } from 'esi-common-layer';
import { Assert } from './assert';
import { ISamsDocument } from './interfaces/ISamsDocument';
import { IPostDocumentResponse } from './interfaces/IPostDocumentResponse';
import { IMapper } from './interfaces/IMapper';
import { TrackingService } from './trackingService';

export class SamsProducerInterface<SourceDocType, TargetDocType extends ISamsDocument> {

    protected readonly trackingService: TrackingService;
    protected readonly logger: any;
    public mapper: IMapper<SourceDocType, TargetDocType>;
    protected readonly interfaceKey: string;
    protected readonly samsUrl: string;
    protected readonly esiAuthToken: string;
    protected readonly webApi: ESIAPIHelper.IWebApiHelper;

    /*==================================================================================================
     * Static factory method for creating a new instance of the ConsumerInterface.
     *   Handles getting the ESI Auth Token from the secret.
     * @returns New instance of ConsumerInterface
     */
    static async createInstance<SourceDocType, TargetDocType extends ISamsDocument>(
        esiOAuthSecretName: string,
        logLevel: ESILogger.LogLevels,
        samsUrl: string,
        interfaceKey: string,
        env: ESIEnvironments,
        mapper: IMapper<SourceDocType, TargetDocType>
    ): Promise<SamsProducerInterface<SourceDocType, TargetDocType>> {

        Assert.isDefined("esiOAuthSecretName", esiOAuthSecretName);
        Assert.isDefined("logLevel", logLevel);
        Assert.isDefined("samsUrl", samsUrl);
        Assert.isDefined("interfaceKey", interfaceKey);
        Assert.isDefined("env", env);
        Assert.isDefined("mapper", mapper);

        const esiAuthToken = await ESIAuthTokenProvider.getToken(esiOAuthSecretName);
        if (!esiAuthToken) {
            throw new Error(`Failed to get ESI Auth Token from secret: ${esiOAuthSecretName}`);
        }
        const trackingService = TrackingService.createInstance(esiAuthToken, interfaceKey, logLevel, env);

        const webApiHelper: ESIAPIHelper.IWebApiHelper = new ESIAPIHelper.WebApiHelper(logLevel);

        const result = new SamsProducerInterface<SourceDocType, TargetDocType>(
            logLevel,
            mapper,
            interfaceKey,
            trackingService,
            samsUrl,
            esiAuthToken,
            webApiHelper);

        return result;
    }

    /*==================================================================================================
     * Constructor to initialize a new instance of the class
     */
    constructor(
        logLevel: ESILogger.LogLevels,
        mapper: IMapper<SourceDocType, TargetDocType>,
        interfaceKey: string,
        trackingService: TrackingService,
        samsUrl: string,
        esiAuthToken: string,
        webApi: ESIAPIHelper.IWebApiHelper
    ) {
        Assert.isDefined("logLevel", logLevel);
        Assert.isDefined("mapper", mapper);
        Assert.isDefined("interfaceKey", interfaceKey);
        Assert.isDefined("trackingService", trackingService);
        Assert.isDefined("samsUrl", samsUrl);
        Assert.isDefined("esiAuthToken", esiAuthToken);
        Assert.isDefined("webApi", webApi);

        this.mapper = mapper;
        this.logger = ESILogger.getLogger(`SamsProduerInterface`, logLevel);
        this.trackingService = trackingService;
        this.interfaceKey = interfaceKey;
        this.samsUrl = samsUrl;
        this.esiAuthToken = esiAuthToken;
        this.webApi = webApi;
    }

    /*==================================================================================================
     * Official processing method for the document.  This method will post the document to the target system.
     * @param targetDoc 
     * @returns 
     */
    async processDocument(sourceDoc: SourceDocType): Promise<IPostDocumentResponse[]> {

        Assert.isDefined("sourceDoc", sourceDoc);

        const responses: IPostDocumentResponse[] = [];

        if (!sourceDoc) {
            throw new Error("[processDocument] Missing required parameter: sourceDoc");
        }
        const targetDocs: TargetDocType[] = await this.mapper.mapToTarget(sourceDoc);

        for (const doc of targetDocs) {

            const samsResponse: IPostDocumentResponse = await this.publish(doc);

            responses.push(samsResponse);
        }
        return responses;
    }

    /*==================================================================================================
     * Implement this method to post the document to the target system.
     * @param targetDoc
     */
    public async publish(doc: ISamsDocument): Promise<IPostDocumentResponse> {

        const response: IPostDocumentResponse = {
            interfaceKey: this.interfaceKey,
            documentKey: null,
            nativeBusinessId: null,
            wasPosted: false,
            errorMessage: null
        };

        response.nativeBusinessId = doc.nativeBusinessId;

        response.documentKey = await this.trackingService.createDoc(response.nativeBusinessId);

        try {
            await this.postToSams(response.documentKey, response.nativeBusinessId, doc);

            response.wasPosted = true;
            await this.trackingService.createDocStep("Post doc to SAMS", ESITrackingServiceDocument.StepStatus.COMPLETED);
            await this.trackingService.updateDocStatus(ESITrackingServiceDocument.DocumentStatus.COMPLETED);
        }
        catch (error) {
            response.errorMessage = error.message;
            await this.trackingService.createDocStep("Post doc to SAMS", ESITrackingServiceDocument.StepStatus.FAILED, error.message);
            await this.trackingService.updateDocStatus(ESITrackingServiceDocument.DocumentStatus.FAILED, error.message);
            response.wasPosted = false;
        }
        return response;
    }

    /*==================================================================================================
 * Implement this method to post the document to the target system.
 * @param targetDoc
 */
    private async postToSams(documentKey: string, nativeBusinessId: string, doc: ISamsDocument): Promise<void> {

        const options = {
            headers: {
                'Content-Type': 'application/json',
                'Accept': '*/*',
                'Authorization': `Bearer ${this.esiAuthToken}`,
                "Interface-key": this.interfaceKey,
                "Native-Business-Id": nativeBusinessId,
                "Document-Key": documentKey
            }
        }
        const maskedDoc = doc.getJson(true);
        this.logger.info(`Posting document to SAMS: ${documentKey} with body: ${maskedDoc}`);

        try {
            const body: string = doc.getJson(false);
            const result: ESIAPIHelper.WebApiResponse<any> = await this.webApi.sendRequest('POST', this.samsUrl, body, options);
            if (result.status > 300) {
                this.logger.error(`Status code: ${result.status}   Response: ${JSON.stringify(result.data)}`);
                throw new Error(`Status code: ${result.status}   Response: ${JSON.stringify(result.data)}`);
            }
        }
        catch (error) {
            let errMessage: string = `Failure posting ${documentKey} to ${this.samsUrl}: `;
            if (error.response) {
                errMessage += `Status: ${error.response.status}  `;
            }
            errMessage += error.message;
            this.logger.error(errMessage);
            throw new Error(errMessage);
        }
    }
}
