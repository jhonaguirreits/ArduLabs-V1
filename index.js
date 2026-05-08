const { onCall } = require("firebase-functions/v2/https");
const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.explicarError = onCall({
  secrets: ["GEMINI_API_KEY"],
  region: "us-central1" // O la región de tu proyecto
}, async (request) => {
  const { code, errorContext, retoDesc } = request.data;

  if (!code || !errorContext) {
    return { explanation: "Faltan datos para el análisis." };
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  let promptText = `Eres un tutor de programación de Arduino. Tu objetivo es guiar al estudiante a entender y corregir sus errores, no darle la solución directa. Explica de forma pedagógica qué significa el siguiente error o problema en el código de Arduino y cómo podría corregirse. Mantén la explicación concisa y enfocada en el aprendizaje. No uses más de 100 palabras.

Código del estudiante:
\`\`\`arduino
${code}
\`\`\`

Contexto del error: ${errorContext}`;

  if (retoDesc) {
    promptText += `\nDescripción del reto: ${retoDesc}`;
  }

  try {
    const result = await model.generateContent(promptText);
    const response = await result.response;
    return { explanation: response.text() };
  } catch (error) {
    console.error("Error en Gemini API:", error);
    return { explanation: "El tutor IA está descansando un momento. ¡Intenta de nuevo en unos segundos!" };
  }
});