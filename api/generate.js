const https = require('https');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }

  const { prompt } = req.body;
  const API_KEY = process.env.ANTHROPIC_API_KEY;

  const anthropicBody = JSON.stringify({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }]
  });

  const options = {
    hostname: 'api.anthropic.com',
    port: 443,
    path: '/v1/messages',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Length': Buffer.byteLength(anthropicBody)
    }
  };

  try {
    const data = await new Promise((resolve, reject) => {
      const apiReq = https.request(options, apiRes => {
        let data = '';
        apiRes.on('data', chunk => data += chunk);
        apiRes.on('end', () => resolve(JSON.parse(data)));
      });
      apiReq.on('error', reject);
      apiReq.write(anthropicBody);
      apiReq.end();
    });

    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: 'Error conectando con la IA' });
  }
};
