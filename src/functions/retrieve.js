const { app } = require('@azure/functions');
const { BlobServiceClient } = require('@azure/storage-blob');

const connectionString = process.env['BlobStorageConnectionString'];
const containerName = 'jotform-submissions';
const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
const containerClient = blobServiceClient.getContainerClient(containerName);

app.http('retrieve', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'retrieve/{formId}/{submissionId}/{key}',
    handler: async (request, context) => {
        context.log('Processing retrieve request');

        const formId = request.params.formId;
        const submissionId = request.params.submissionId;
        const key = request.params.key;

        if (!formId || !submissionId || !key) {
            return {
                status: 400,
                body: JSON.stringify({ error: 'Missing formId, submissionId, or key' })
            };
        }

        try {
            const blobName = `${formId}/${submissionId}.json`;
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);
            const downloadResponse = await blockBlobClient.download();
            const content = await streamToString(downloadResponse.readableStreamBody);
            const data = JSON.parse(content);

            const value = data[key] || null;
            return {
                status: 200,
                body: JSON.stringify({ value })
            };
        } catch (error) {
            context.log.error('Error retrieving blob:', error);
            return {
                status: 404,
                body: JSON.stringify({ value: 'Not found' })
            };
        }
    }
});

async function streamToString(readableStream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        readableStream.on('data', (chunk) => chunks.push(chunk));
        readableStream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
        readableStream.on('error', reject);
    });
}