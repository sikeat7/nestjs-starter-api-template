export default interface AzureBlobResponseDto {
    status: number;
    requestId: string;
    url: string;
    originalFileName: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    hasError?: boolean;
}