// secretManager.js
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

const client = new SecretManagerServiceClient({
  credentials: JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT),
});

// Extract project ID from Firebase service account JSON instead of env var
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
const projectId = serviceAccount.project_id;

const secretName = 'STRIPE_SECRET_KEY'; // your secret's name in Secret Manager

async function getStripeSecret() {
  const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;
  const [version] = await client.accessSecretVersion({ name });
  const payload = version.payload.data.toString('utf8');
  return payload;
}

module.exports = { getStripeSecret };
