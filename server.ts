import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (err) {
      console.error("Failed to initialize GoogleGenAI:", err);
    }
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // AI Transit Advisor API
  app.post("/api/transit-advisor", async (req, res) => {
    try {
      const { origin, destination, city, routeSummary, userQuestion } = req.body;

      const ai = getGeminiClient();
      if (!ai) {
        // High quality fallback responses if API key is not yet set
        return res.json({
          advice: `💡 **Dica de Especialista em Transporte (${city || 'Metropolitano'}):**\n\n` +
            `• **Melhor Horário:** Para a rota entre **${origin || 'Origem'}** e **${destination || 'Destino'}**, evite o pico entre 17h30 e 19h15 para viajar com mais conforto.\n` +
            `• **Posicionamento Estratégico:** Embarque nos vagões centrais ou próximos às escadas rolantes para facilitar baldeações rápidas.\n` +
            `• **Integração Tarifária:** Utilize bilhete eletrônico/cartão de transporte para garantir o desconto de integração dentro da janela de 3 horas.\n` +
            `• **Acessibilidade & Bagagem:** As estações de metrô possuem elevadores preferenciais e bloqueios acessíveis mais largos caso esteja com malas ou bicicleta.`
        });
      }

      const prompt = `Você é um especialista em mobilidade urbana e transporte público para a cidade de ${city || 'São Paulo/Metropolitana'}.
O usuário está planejando uma rota de "${origin}" para "${destination}".
Detalhes da rota calculada: ${JSON.stringify(routeSummary || {})}.
Pergunta/Dúvida do usuário: ${userQuestion || 'Quais são as melhores dicas, estratégias de baldeação, melhores horários e recomendações de tarifa para este trajeto?'}.

Por favor, forneça uma resposta clara, amigável, precisa e prática em português do Brasil contendo:
1. Recomendações de melhores horários e como evitar lotação.
2. Dica de posicionamento no trem/metrô/ônibus (qual vagão ou porta facilita a baldeação).
3. Informações sobre economia tarifária (integração, bilhete único, etc.).
4. Dicas de segurança, conforto ou acessibilidade relevantes para este trajeto.
Mantenha o texto bem formatado com marcadores objetivos e destaque em negrito.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      res.json({ advice: response.text || "Sem resposta gerada pelo modelo." });
    } catch (error: any) {
      console.error("Error in /api/transit-advisor:", error);
      res.status(500).json({
        error: "Erro ao consultar o assistente de trânsito.",
        details: error.message
      });
    }
  });

  // AI Custom Route Generator (for arbitrary custom addresses or cities worldwide)
  app.post("/api/custom-route-search", async (req, res) => {
    try {
      const { origin, destination, city, preference } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.status(200).json({ custom: false });
      }

      const prompt = `Como planejador de rotas de transporte público na cidade de ${city || 'Brasil'}, crie um itinerário realista e detalhado em JSON de "${origin}" para "${destination}" com preferência "${preference || 'mais rapida'}".
Responda EXCLUSIVAMENTE um objeto JSON válido no seguinte formato:
{
  "title": "Nome da Rota (ex: Metrô Linha X + Ônibus Y)",
  "totalDurationMinutes": 38,
  "totalFare": 8.20,
  "totalWalkingMeters": 450,
  "transfers": 1,
  "co2SavedKg": 1.4,
  "steps": [
    {
      "type": "walk",
      "instruction": "Caminhe até a Estação...",
      "durationMinutes": 5,
      "distanceMeters": 350
    },
    {
      "type": "transit",
      "mode": "subway",
      "lineName": "Linha 4 - Amarela",
      "lineColor": "#f59e0b",
      "fromStation": "Estação Paulista",
      "toStation": "Estação Pinheiros",
      "stopsCount": 4,
      "durationMinutes": 12,
      "headsign": "Sentido Vila Sônia"
    },
    {
      "type": "transfer",
      "instruction": "Faça baldeação para a Linha 9 - Esmeralda",
      "durationMinutes": 4
    },
    {
      "type": "transit",
      "mode": "train",
      "lineName": "Linha 9 - Esmeralda",
      "lineColor": "#10b981",
      "fromStation": "Estação Pinheiros",
      "toStation": "Estação Berrini",
      "stopsCount": 3,
      "durationMinutes": 9,
      "headsign": "Sentido Mendes-Vila Natal"
    },
    {
      "type": "walk",
      "instruction": "Caminhe até o destino final",
      "durationMinutes": 3,
      "distanceMeters": 100
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json({ custom: true, route: parsed });
    } catch (err: any) {
      console.error("Error generating custom route:", err);
      res.status(200).json({ custom: false });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ViaTransito server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
