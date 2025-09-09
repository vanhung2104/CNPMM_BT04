const { Client } = require('@elastic/elasticsearch');

// Create Elasticsearch client from environment variables
// Required: ELASTICSEARCH_NODE (e.g., http://localhost:9200)
// Optional: ELASTICSEARCH_USERNAME, ELASTICSEARCH_PASSWORD, ELASTICSEARCH_CA_CERT
let client = null;
let loggedEsStatus = false;

function getEsClient() {
    if (client) return client;

    const node = process.env.ELASTICSEARCH_NODE;
    if (!node) {
        // Elasticsearch is optional; return null to allow graceful fallback
        if (!loggedEsStatus) {
            console.log('[Search] Driver=MONGO (ELASTICSEARCH_NODE not set)');
            loggedEsStatus = true;
        }
        return null;
    }

    // Simplified: no auth/TLS, rely on http node (dev)
    client = new Client({ node });
    if (!loggedEsStatus) {
        console.log(`[Search] Driver=ELASTICSEARCH node=${node} auth=off tls=off`);
        loggedEsStatus = true;
    }
    return client;
}

module.exports = {
    getEsClient
};
