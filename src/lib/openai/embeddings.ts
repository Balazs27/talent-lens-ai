import { getOpenAIClient } from "./client"

const MAX_CHARS = 8000

/**
 * Generate a semantic embedding for the given text using
 * OpenAI text-embedding-3-small (1536 dimensions).
 *
 * Input is sanitized before embedding:
 * - Collapse runs of whitespace to a single space
 * - Trim leading/trailing whitespace
 * - Truncate to MAX_CHARS to stay well within token limits
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const sanitized = text.replace(/\s+/g, " ").trim().slice(0, MAX_CHARS)

  const client = getOpenAIClient()
  const response = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: sanitized,
    encoding_format: "float",
  })
  return response.data[0].embedding
}
