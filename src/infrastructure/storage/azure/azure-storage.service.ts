import { Injectable } from '@nestjs/common';
import AzureBlobResponseDto from './azure-blob-response.dto';
import { BlobServiceClient } from '@azure/storage-blob';
import { AppConfig } from 'src/config/app.config';
import * as path from 'path';
import Miscellaneous from 'src/utils/miscellaneous.utils';

@Injectable()
export class AzureStorageService {

    constructor(private readonly appConfig: AppConfig) { }

    async uploadBlob(
        file: Express.Multer.File,
        directoryPath?: string,
        renameIfExists: boolean = true
    ): Promise<AzureBlobResponseDto> {

        try {
            // Create a BlobServiceClient
            const blobServiceClient = BlobServiceClient.fromConnectionString(this.appConfig.azureStorage.connectionString);

            // Get a container client
            const containerClient = blobServiceClient.getContainerClient(this.appConfig.azureStorage.containerName);

            // Specify the directory within the container
            if (!directoryPath) {
                directoryPath = 'uploads/';
            }

            directoryPath = directoryPath.toLowerCase();

            let originalFileName = file.originalname;
            let originalValidFileName = Miscellaneous.createValidFilename(file.originalname);
            let finalFileName = originalValidFileName;

            let blobName = path.join(directoryPath, finalFileName);
            let blockBlobClient = containerClient.getBlockBlobClient(blobName);

            if (renameIfExists) {
                let isExists = await blockBlobClient.exists();
                while (isExists) {
                    const timestamp = Date.now();
                    const ext = path.extname(originalValidFileName);
                    const baseName = path.basename(originalValidFileName, ext);
                    finalFileName = `${baseName}_${timestamp}${ext}`;
                    blobName = path.join(directoryPath, finalFileName);
                    blockBlobClient = containerClient.getBlockBlobClient(blobName);
                    isExists = await blockBlobClient.exists();
                }
            }

            const uploadBlobResponse = await blockBlobClient.upload(file.buffer, file.buffer.length, {
                blobHTTPHeaders: {
                    blobContentType: file.mimetype,
                },
            });

            const reposne: AzureBlobResponseDto = {
                status: uploadBlobResponse._response.status,
                requestId: uploadBlobResponse.requestId ?? '',
                originalFileName: originalFileName,
                fileName: finalFileName,
                fileType: file.mimetype,
                fileSize: file.size,
                url: uploadBlobResponse._response.request.url
                    .replace(this.appConfig.azureStorage.defaultDomain, this.appConfig.azureStorage.assignedDomain)
                    .replace(/%5C/g, '/'),
                hasError: !uploadBlobResponse.requestId,
            };
            return reposne;
        } catch (err) {
            console.log('err', err);
            const reposne: AzureBlobResponseDto = {
                status: 400,
                requestId: '',
                originalFileName: '',
                fileName: '',
                fileType: '',
                fileSize: file.size,
                url: '',
                hasError: true,
            };
            return reposne;
        }
    }

    async deleteBlob(blobName: string, directoryPath: string): Promise<boolean> {
        try {
            const blobServiceClient = BlobServiceClient.fromConnectionString(this.appConfig.azureStorage.connectionString);
            const containerClient = blobServiceClient.getContainerClient(this.appConfig.azureStorage.containerName);

            // Specify the directory within the container
            const blobPath = path.join(directoryPath, blobName);
            const blockBlobClient = containerClient.getBlockBlobClient(blobPath);

            const blobExists = await blockBlobClient.exists();
            if (blobExists) {
                await blockBlobClient.delete();
                return true;
            }

            return false;
        } catch (err) {
            throw new Error(err as string);
        }
    }
}
