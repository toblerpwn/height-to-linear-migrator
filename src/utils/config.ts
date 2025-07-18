import { config } from 'dotenv';
import { z } from 'zod';

// Load environment variables
config();

// Environment schema validation
const envSchema = z.object({
  // Height API Configuration
  HEIGHT_API_TOKEN: z.string().min(1, 'Height API token is required'),
  
  // Linear API Configuration
  LINEAR_API_KEY: z.string().min(1, 'Linear API key is required'),
  
  // Optional: Linear Workspace ID (if you have multiple workspaces)
  LINEAR_WORKSPACE_ID: z.string().optional(),
});

// Parse and validate environment variables
const env = envSchema.parse(process.env);

// Export the validated environment variables
export default env;

// Export individual configs for convenience
export const heightConfig = {
  apiToken: env.HEIGHT_API_TOKEN,
} as const;

export const linearConfig = {
  apiKey: env.LINEAR_API_KEY,
  workspaceId: env.LINEAR_WORKSPACE_ID,
} as const; 