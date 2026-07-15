import { config } from 'dotenv';
config({ path: '.env.local' });

async function run() {
  const params = new URLSearchParams({
    client_id: process.env.ENTRA_CLIENT_ID,
    client_secret: process.env.ENTRA_CLIENT_SECRET,
    scope: 'https://api.businesscentral.dynamics.com/.default',
    grant_type: 'client_credentials'
  });

  const res = await fetch(`https://login.microsoftonline.com/${process.env.ENTRA_TENANT_ID}/oauth2/v2.0/token`, {
    method: 'POST',
    body: params,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  const data = await res.json();
  const token = data.access_token;
  
  const baseUrl = process.env.BC_API_URL;
  const endpoint = `/api/alletec/moneyTracker/v1.0/companies(${process.env.BC_COMPANY_ID})/transactions?$top=500`;
  const url = `${baseUrl}${endpoint}`;

  console.log('Fetching:', url);

  const apiRes = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });

  console.log('Status:', apiRes.status, apiRes.statusText);
  const text = await apiRes.text();
  console.log('Body:', text);
}

run().catch(console.error);
