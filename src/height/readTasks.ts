import Height from 'height-app-api';
import { heightConfig } from '../utils/config';

// Define the task type based on Height API response
export interface HeightTask {
  id: string;
  model: 'task';
  index: number;
  listIds: string[];
  name: string;
  description: string;
  status: string;
  assigneesIds: string[];
  fields: Array<{
    fieldTemplateId: string;
    value?: string;
    date?: string;
    labels?: string[];
    linkedTasks?: Array<{
      id?: string;
      index?: number;
    }>;
  }>;
  deleted: boolean;
  deletedAt: string;
  deletedByUserId: string;
  completed: boolean;
  completedAt: string;
  createdAt: string;
  createdUserId: string;
  lastActivityAt: string;
  url: string;
  trashedAt: string;
  trashedByUserId: string;
  parentTaskId?: string;
  [key: string]: any; // For any other properties
}

// Function to get all tasks for a specific list
export async function getHeightTasks(listId: string): Promise<HeightTask[]> {
  try {
    // Initialize Height client
    const height = new Height({ secretKey: heightConfig.apiToken });
    
    // Search for tasks in the specific list
    const { list: tasks } = await height.tasks.search({
      filters: {
        listIds: {
          values: [listId]
        }
      }
    });
    
    if (!tasks || tasks.length === 0) {
      return [];
    }
    
    return tasks as HeightTask[];
  } catch (error) {
    console.error('❌ Error reading tasks from Height:', error);
    throw error;
  }
}

// Function to get a specific task by ID
export async function getHeightTask(taskId: string): Promise<HeightTask | null> {
  try {
    // Initialize Height client
    const height = new Height({ secretKey: heightConfig.apiToken });
    
    // Get the specific task
    const task = await height.tasks.get({ id: taskId });
    
    return task as HeightTask;
  } catch (error) {
    console.error('❌ Error reading task from Height:', error);
    return null;
  }
}

export async function readHeightTasks(listId: string): Promise<void> {
  try {
    console.log(`📋 Reading tasks for list: ${listId}`);
    const tasks = await getHeightTasks(listId);
    
    console.log(`✅ Found ${tasks.length} tasks in list`);
    console.log('');
    
    if (tasks.length === 0) {
      console.log('⚠️  No tasks found. This could mean:');
      console.log('   - No tasks exist in this list');
      console.log('   - API token doesn\'t have access to tasks');
      console.log('   - List ID is incorrect');
      console.log('');
    } else {
      tasks.forEach((task, index) => {
        console.log(`${index + 1}. ${task.name} (T-${task.index})`);
        console.log(`   Status: ${task.status}`);
        console.log(`   Created: ${new Date(task.createdAt).toLocaleDateString()}`);
        if (task.completed) {
          console.log(`   Completed: ${new Date(task.completedAt).toLocaleDateString()}`);
        }
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Error reading tasks from Height:', error);
    throw error;
  }
} 