import { ESIEnvironments, ESILogger, ESITrackingServiceDocument } from 'esi-common-layer';

export class TrackingService {
    protected logger: any;
    protected docTrackingService: ESITrackingServiceDocument.DocumentService;
    protected readonly interfaceKey: string;

    public documentKey: string;

    /*==================================================================================================
     * Static factor method for creating a new instance of the TrackingService.  Handles getting the ESI Auth Token from the secret.
     * @returns New instance of Tracking Service
     */
    static createInstance(
        esiAuthToken: string,
        interfaceKey: string,
        logLevel: ESILogger.LogLevels,
        env: ESIEnvironments,
        documentKey?: string
    ): TrackingService {
        if (!esiAuthToken) {
            throw new Error("[createTrackingService] Required parameter missing: esiAuthToken");
        }
        if (!interfaceKey) {
            throw new Error("[createTrackingService] Required parameter missing: interfaceKey");
        }

        const docService = new ESITrackingServiceDocument.DocumentService({
            env: env,
            accessToken: esiAuthToken
        }, interfaceKey, true, logLevel);

        const trackingService = new TrackingService(interfaceKey, logLevel, docService, documentKey);
        return trackingService;
    }


    /*==================================================================================================
     * Construtor
     */
    constructor(
        interfaceKey: string,
        logLevel: ESILogger.LogLevels,
        documentService: ESITrackingServiceDocument.DocumentService,
        documentKey?: string
    ) {
        if (!interfaceKey) {
            throw new Error("[trackingService] Required parameter missing: interfaceKey");
        }
        if (!documentService) {
            throw new Error("[trackingService] Required parameter missing: documentService");
        }
        this.interfaceKey = interfaceKey;
        this.logger = ESILogger.getLogger(this.constructor.name, logLevel);
        this.docTrackingService = documentService;
        this.documentKey = documentKey;
    }

    /*==================================================================================================
     * Call Tracking Service API to create new tracking document.
     * Returns the document key.
     */
    public async createDoc(nativeBusinessId: string, docStepProcess?: string): Promise<string> {

        let step: ESITrackingServiceDocument.CreateStepInput = null;
        let doc: ESITrackingServiceDocument.DocumentResponse;

        if (docStepProcess) {
            step = {
                process: docStepProcess,
                started_time: new Date(),
                interface_key: this.interfaceKey,
            };
        }
        try {
            doc = await this.docTrackingService.create(
                {
                    interface_key: this.interfaceKey,
                    native_business_id: nativeBusinessId,
                    status: ESITrackingServiceDocument.DocumentStatus.PROCESSING,
                    started_time: new Date(),
                    batch_key: null,
                    error_message: null,
                    interfaceDocumentStep: step
                }
            );
        }
        catch (error) {
            this.logger.error(`Error creating tracking document for ${nativeBusinessId}: ${JSON.stringify(error)}`);
            throw error;
        }
        this.logger.info(`Tracking Document ${doc.key} created for native business id: ${nativeBusinessId}`);
        this.documentKey = doc.key;
        return this.documentKey;
    }

    /*==================================================================================================
     * Call Tracking Service API to create new doc step
     */
    public async createDocStep(process: string, status: ESITrackingServiceDocument.StepStatus, errorMessage?: string): Promise<void> {

        try {
            this.VerifyDocKey("CreateDocStep");
            
            await this.docTrackingService.createStep(
                {
                    process: process,
                    started_time: new Date(),
                    status: status,
                    error_message: errorMessage || null
                },
                this.documentKey
            );
        }
        catch (error) {
            this.logger.error(`Error creating document step for ${this.documentKey} for process [${process}]: ${JSON.stringify(error)}`);
        }
    }

    /*==================================================================================================
     * Call Tracking Service API to update the status of the document
     */
    public async updateDocStatus(status: ESITrackingServiceDocument.DocumentStatus, errorMessage?: string): Promise<void> {

        try {
            this.VerifyDocKey("UpdateDocumentStatus");

            const updateParams: ESITrackingServiceDocument.UpdateDocumentInput = {
                key: this.documentKey,
                interface_key: this.interfaceKey,
                status: status,
                error_message: errorMessage || null
            };
            await this.docTrackingService.update(updateParams, true);
        }
        catch (error) {
            this.logger.error(`Error updating document status for ${this.documentKey}: ${JSON.stringify(error)}`);
        }
    }

    /*==================================================================================================
     * Quick check to verify doc key has been set
     */
    private VerifyDocKey(currentAction: string) {
        if (!this.documentKey) {
            throw new Error(`[${currentAction}] Document Key is undefined`);
        }
    }
}
