export function createInferenceClient(config = {}) {
  const baseUrl =
    config.inferenceUrl ||
    config.baseUrl ||
    process.env.SPEAKEASY_BASE_URL ||
    'https://api.speakeasyrelay.com';

  return {
    provider: config.provider || 'speakeasy',
    baseUrl,
    routes: {
      research: config.researchModel || config.routes?.research || 'deepseek-v3.2',
      deep_think: config.thinkModel || config.routes?.deep_think || 'qwen3-235b-a22b-thinking-2507',
      codegen: config.codeModel || config.routes?.codegen || 'qwen3-coder-480b-a35b-instruct',
      uncensored: config.uncensoredModel || config.routes?.uncensored || 'venice-uncensored'
    }
  };
}
