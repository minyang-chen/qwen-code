import OpenAI from 'openai';
import { pool } from '../config/database';
import {
  EMBEDDING_API_KEY,
  EMBEDDING_BASE_URL,
  EMBEDDING_MODEL,
  OPENAI_API_KEY,
  OPENAI_BASE_URL,
} from '../config/env';

const openai = new OpenAI({
  apiKey: EMBEDDING_API_KEY || OPENAI_API_KEY || 'dummy',
  baseURL: EMBEDDING_BASE_URL || OPENAI_BASE_URL,
});

export const embeddingService = {
  async generateEmbedding(text: string): Promise<number[]> {
    const apiKey = EMBEDDING_API_KEY || OPENAI_API_KEY;
    if (!apiKey) {
      console.log('No embedding API key, skipping embedding generation');
      return [];
    }

    try {
      const response = await openai.embeddings.create({
        model: EMBEDDING_MODEL || 'text-embedding-3-small',
        input: text.substring(0, 8000),
      });
      return response.data[0].embedding;
    } catch (error) {
      console.error('Embedding generation error:', error);
      console.log('Skipping embedding for this file');
      return [];
    }
  },

  async storeFileEmbedding(
    filePath: string,
    fileName: string,
    workspaceType: string,
    ownerId: string | null,
    teamId: string | null,
    contentHash: string,
    embedding: number[],
  ) {
    if (embedding.length === 0) return;

    const embeddingStr = `[${embedding.join(',')}]`;
    await pool.query(
      `INSERT INTO file_embeddings 
       (file_path, file_name, workspace_type, owner_id, team_id, content_hash, embedding)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (file_path) DO UPDATE SET
         embedding = EXCLUDED.embedding,
         content_hash = EXCLUDED.content_hash,
         updated_at = CURRENT_TIMESTAMP`,
      [
        filePath,
        fileName,
        workspaceType,
        ownerId,
        teamId,
        contentHash,
        embeddingStr,
      ],
    );
  },

  async searchSimilarFiles(
    queryEmbedding: number[],
    workspaceType: string,
    userId: string,
    teamId: string | null,
    limit: number = 10,
  ) {
    if (queryEmbedding.length === 0) return [];

    const embeddingStr = `[${queryEmbedding.join(',')}]`;

    let query: string;
    let params: Array<string | number>;

    if (workspaceType === 'team' && teamId) {
      query = `
        SELECT file_path, file_name,
               1 - (embedding <=> $1::vector) as similarity_score
        FROM file_embeddings
        WHERE workspace_type = 'team' AND team_id = $2
        ORDER BY embedding <=> $1::vector
        LIMIT $3
      `;
      params = [embeddingStr, teamId, limit];
    } else {
      query = `
        SELECT file_path, file_name,
               1 - (embedding <=> $1::vector) as similarity_score
        FROM file_embeddings
        WHERE workspace_type = 'private' AND owner_id = $2
        ORDER BY embedding <=> $1::vector
        LIMIT $3
      `;
      params = [embeddingStr, userId, limit];
    }

    const result = await pool.query(query, params);
    return result.rows;
  },
};
