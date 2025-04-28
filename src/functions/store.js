const { app } = require('@azure/functions');
const { BlobServiceClient } = require('@azure/storage-blob');

const connectionString = process.env['BlobStorageConnectionString'];
const containerName = 'jotform-submissions';
const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
const containerClient = blobServiceClient.getContainerClient(containerName);

app.http('store', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log('Processing store request');

        try {
            const body = await request.json();
            const { formId, submissionId, data } = body;

            if (!formId || !submissionId || !data) {
                return {
                    status: 400,
                    body: JSON.stringify({ error: 'Missing formId, submissionId, or data' })
                };
            }

            const blobName = `${formId}/${submissionId}.json`;
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);
            const content = JSON.stringify(data);

            await blockBlobClient.upload(content, content.length, {
                blobHTTPHeaders: { blobContentType: 'application/json' }
            });

            return {
                status: 200,
                body: JSON.stringify({ message: 'Data stored' })
            };
        } catch (error) {
            context.log.error('Error storing blob:', error);
            return {
                status: 500,
                body: JSON.stringify({ error: 'Failed to store data' })
            };
        }
    }
});