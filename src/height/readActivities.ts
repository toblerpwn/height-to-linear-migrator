import Height from 'height-app-api';
import { heightConfig } from '../utils/config';
import pLimit from 'p-limit';

// Define the activity type based on Height API response
export interface HeightActivity {
  id: string;
  model: 'activity';
  taskId: string;
  type: string;
  createdAt: string;
  createdUserId: string;
  data?: any; // Make data optional since it might not always be present
  [key: string]: any; // For any other properties
}

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  maxConcurrent: 5,
  delayBetweenBatches: 1000, // 1 second delay between batches
  retryAttempts: 3,
  retryDelay: 2000, // 2 seconds between retries
};

// Create a promise limiter using p-limit
const limit = pLimit(RATE_LIMIT_CONFIG.maxConcurrent);

// Function to get activities for a single task with retry logic
async function getTaskActivities(taskId: string, retryCount = 0): Promise<HeightActivity[]> {
  try {
    const height = new Height({ secretKey: heightConfig.apiToken });
    
    // Get activities for the specific task
    const { list: activities } = await height.activities.get({
      taskId: taskId
    });
    
    if (!activities || activities.length === 0) {
      return [];
    }
    
    return activities as HeightActivity[];
  } catch (error) {
    if (retryCount < RATE_LIMIT_CONFIG.retryAttempts) {
      console.log(`⚠️  Retrying activities for task ${taskId} (attempt ${retryCount + 1}/${RATE_LIMIT_CONFIG.retryAttempts})`);
      await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_CONFIG.retryDelay));
      return getTaskActivities(taskId, retryCount + 1);
    }
    
    console.error(`❌ Failed to get activities for task ${taskId} after ${RATE_LIMIT_CONFIG.retryAttempts} attempts:`, error);
    throw error;
  }
}

// Function to get activities for multiple tasks with parallelization and rate limiting
export async function getTasksActivities(taskIds: string[]): Promise<Map<string, HeightActivity[]>> {
  const results = new Map<string, HeightActivity[]>();
  
  console.log(`🔄 Fetching activities for ${taskIds.length} tasks with max ${RATE_LIMIT_CONFIG.maxConcurrent} concurrent requests...`);
  
  // Process in batches to respect rate limits
  const batchSize = RATE_LIMIT_CONFIG.maxConcurrent;
  for (let i = 0; i < taskIds.length; i += batchSize) {
    const batch = taskIds.slice(i, i + batchSize);
    console.log(`📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(taskIds.length / batchSize)} (${batch.length} tasks)...`);
    
    // Process batch using p-limit
    const batchPromises = batch.map(taskId => 
      limit(async () => {
        try {
          const activities = await getTaskActivities(taskId);
          return { taskId, activities };
        } catch (error) {
          console.error(`❌ Failed to get activities for task ${taskId}:`, error);
          return { taskId, activities: [] };
        }
      })
    );
    
    // Wait for current batch to complete
    const batchResults = await Promise.all(batchPromises);
    
    // Store results
    batchResults.forEach(({ taskId, activities }: { taskId: string; activities: HeightActivity[] }) => {
      results.set(taskId, activities);
    });
    
    // Add delay between batches if there are more tasks
    if (i + batchSize < taskIds.length) {
      console.log(`⏳ Rate limiting: waiting ${RATE_LIMIT_CONFIG.delayBetweenBatches}ms before next batch...`);
      await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_CONFIG.delayBetweenBatches));
    }
  }
  
  const successfulTasks = Array.from(results.values()).filter(activities => activities.length > 0).length;
  console.log(`✅ Successfully fetched activities for ${successfulTasks} tasks`);
  return results;
}

// Function to get activities for a single task (convenience function)
export async function getTaskActivitiesSingle(taskId: string): Promise<HeightActivity[]> {
  return getTaskActivities(taskId);
}

// Function to display activity information (for debugging)
export function logActivityDetails(activity: HeightActivity, isListItem: boolean = false): void {
  const prefix = isListItem ? '   ' : '';
  console.log(`${prefix}Activity ID: ${activity.id}`);
  console.log(`${prefix}Type: ${activity.type}`);
  console.log(`${prefix}Created: ${new Date(activity.createdAt).toLocaleDateString()}`);
  console.log(`${prefix}User: ${activity.createdUserId}`);
  if (activity.data) {
    console.log(`${prefix}Data: ${JSON.stringify(activity.data, null, 2)}`);
  }
  console.log('');
} 