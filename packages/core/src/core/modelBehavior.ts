/**
 * Model-specific behavior configuration for handling tool calls and responses
 */
export interface ModelBehaviorConfig {
  /**
   * Whether the model generates immediate text response after receiving tool results
   * - true: Model responds immediately in same turn (OpenAI, Gemini)
   * - false: Model may defer response to next user prompt (some Qwen models)
   */
  requiresImmediateToolResponse: boolean;

  /**
   * Whether to allow empty text responses after tool execution
   * - true: Empty responses are valid (deferred response pattern)
   * - false: Must have text content after tools (immediate response pattern)
   */
  allowsEmptyResponseAfterTools: boolean;
}

export enum ModelProvider {
  QWEN = 'qwen',
  OPENAI = 'openai',
  GEMINI = 'gemini',
  UNKNOWN = 'unknown',
}

/**
 * Detect model provider from model string
 */
export function detectModelProvider(model: string): ModelProvider {
  const modelLower = model.toLowerCase();

  if (modelLower.includes('qwen')) {
    return ModelProvider.QWEN;
  }
  if (modelLower.includes('gemini')) {
    return ModelProvider.GEMINI;
  }

  // Default to OpenAI for unknown models (gpt, o1, etc.)
  return ModelProvider.OPENAI;
}

/**
 * Get behavior configuration for a specific model
 */
export function getModelBehavior(model: string): ModelBehaviorConfig {
  const provider = detectModelProvider(model);

  switch (provider) {
    case ModelProvider.QWEN:
      return {
        requiresImmediateToolResponse: false,
        allowsEmptyResponseAfterTools: true,
      };

    case ModelProvider.GEMINI:
      return {
        requiresImmediateToolResponse: true,
        allowsEmptyResponseAfterTools: false,
      };

    case ModelProvider.OPENAI:
    case ModelProvider.UNKNOWN:
    default:
      return {
        requiresImmediateToolResponse: true,
        allowsEmptyResponseAfterTools: false,
      };
  }
}
