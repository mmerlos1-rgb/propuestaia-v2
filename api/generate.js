const https = require("https");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    // Parse body manually if needed
    let body = req.body;
    if (typeof body === "string") {
      body = JSON.parse(body);
    }
    
    const prompt = body?.prompt;
    const API_KEY = process.env.ANTHROPIC_API_KEY;

    if (!API_KEY) {
      return res.status(500).json({ error: "API Key no configurada" });
    }

    if (!prompt) {
      return res.status(400).json({ error: "Falta el prompt" });
    }

    const anthropicBody = JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    });

    const result = await new Promise((resolve, reject) => {
      const apiReq = https.request(
        {
          hostname: "api.anthropic.com",
          port: 443,
          path: "/v1/messages",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": API_KEY,
            "anthropic-version": "2023-06-01",
            "Content-Length": Buffer.byteLength(anthropicBody),
          },
        },
        (apiRes) => {
          let data = "";
          apiRes.on("data", (chunk) => (data += chunk));
          apiRes.on("end", () => resolve(data));
        }
      );
      apiReq.on("error", reject);
      apiReq.write(anthropicBody);
      apiReq.end();
    });

    const parsed = JSON.parse(result);
    return res.status(200).json(parsed);

  } catch (e) {
    return res.status(500).json({ error: "Error: " + e.message });
  }
};
