module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
 
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
 
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Metodo no permitido' });
    return;
  }
 
  var key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    res.status(500).json({ error: 'API Key no configurada' });
    return;
  }
 
  var body = req.body;
  if (!body || !body.prompt) {
    res.status(400).json({ error: 'Falta el prompt' });
    return;
  }
 
  var response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      messages: [{ role: 'user', content: body.prompt }]
    })
  });
 
  var data = await response.json();
  res.status(200).json(data);
};
