const TOKEN = '_NoJ3fjRXWzppGb2IbtvYrVFMdtWTp5I9P62fQff';
const PROJECT_ID = 'e2b32a33-6db9-4a9f-855d-84aac2538aaa';
const ACCOUNT = 'renny-12';
const SLUG = 'flash-urbano';

async function testEndpoint(name: string, url: string, method: string = 'GET', body?: any) {
  console.log(`\n--- Test: ${name} ---`);
  console.log(`URL: ${url}`);
  try {
    const res = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    });
    
    console.log(`Status: ${res.status} ${res.statusText}`);
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      console.log('Response (JSON):', JSON.stringify(json, null, 2).slice(0, 500) + '...');
    } catch {
      console.log('Response (TEXT):', text.slice(0, 500) + '...');
    }
  } catch (err: any) {
    console.log(`Error: ${err.message}`);
  }
}

const gqlQuery1 = {
  query: `
    query GetBuilds {
      app {
        byId(appId: "${PROJECT_ID}") {
          id
          builds(limit: 1, offset: 0, filter: { platform: ANDROID, status: FINISHED }) {
            artifacts {
              buildUrl
            }
          }
        }
      }
    }
  `
};

async function runTests() {
  await testEndpoint('GraphQL byId with offset', 'https://api.expo.dev/graphql', 'POST', gqlQuery1);
}

runTests();
