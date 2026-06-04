module.exports = async function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({error:'Metodo no permitido'}); return; }
  try {
    var body = req.body;
    if (typeof body === 'string') body = JSON.parse(body);
    if (!body) {
      var chunks = [];
      for await (var chunk of req) chunks.push(chunk);
      body = JSON.parse(Buffer.concat(chunks).toString());
    }
    var prompt = body.prompt;
    var key = process.env.ANTHROPIC_API_KEY;
    if (!key) { res.status(500).json({error:'Sin API key'}); return; }
    if (!prompt) { res.status(400).json({error:'Sin prompt'}); return; }
    var r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 1024,
        messages: [{role:'user', content: prompt}]
      })
    });
    var text = await r.text();
    res.status(r.status).send(text);
  } catch(e) {
    res.status(500).json({error: e.message});
  }
};
