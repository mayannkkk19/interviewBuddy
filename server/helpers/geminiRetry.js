// server/helpers/geminiRetry.js

export async function callGeminiWithRetry(fn, retries = 3, delay = 1200) {
  try {
    return await fn();
  } catch (error) {
    const errorMsg = error?.message || error?.toString() || "";
    const isRateLimit =
      error?.status === 429 ||
      errorMsg.includes("429") ||
      errorMsg.includes("RESOURCE_EXHAUSTED");

    if (isRateLimit && retries > 0) {
      console.warn(
        `[Gemini Rate Limit] 429 detected. Retrying in ${delay}ms... (${retries} attempts left)`
      );
      
      // Wait delay + random jitter (100ms-300ms) to un-sync retries
      await new Promise((resolve) =>
        setTimeout(resolve, delay + Math.floor(Math.random() * 200 + 100))
      );
      
      return callGeminiWithRetry(fn, retries - 1, delay * 2);
    }
    
    throw error;
  }
}