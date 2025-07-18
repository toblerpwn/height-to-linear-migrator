import fs from 'fs/promises';
import path from 'path';
import { HeightList } from '../height/readLists';
import { HeightTask, getHeightTasks } from '../height/readTasks';
import { HeightActivity, getTasksActivities } from '../height/readActivities';

// Export directory that will be gitignored
const EXPORT_DIR = 'exports';

// Ensure export directory exists
async function ensureExportDir(): Promise<void> {
  try {
    await fs.access(EXPORT_DIR);
  } catch {
    await fs.mkdir(EXPORT_DIR, { recursive: true });
  }
}

// Generate a safe filename from list name
function generateSafeFilename(listName: string): string {
  return listName
    .replace(/[^a-z0-9]/gi, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .toLowerCase();
}

// Export interface for the complete data structure
export interface HeightListExport {
  list: HeightList;
  tasks: HeightTask[];
  activities: Map<string, HeightActivity[]>; // Map of taskId -> activities array
  exportMetadata: {
    exportedAt: string;
    totalTasks: number;
    completedTasks: number;
    activeTasks: number;
    totalActivities: number;
    tasksWithActivities: number;
  };
}

// Main export function
export async function exportHeightList(list: HeightList, includeActivities: boolean = true): Promise<string> {
  try {
    // Ensure export directory exists
    await ensureExportDir();
    
    // Get all tasks for this list
    const tasks = await getHeightTasks(list.id);
    
    // Calculate metadata
    const completedTasks = tasks.filter(task => task.completed).length;
    const activeTasks = tasks.length - completedTasks;
    
    // Get activities if requested
    let activities = new Map<string, HeightActivity[]>();
    let totalActivities = 0;
    let tasksWithActivities = 0;
    
    if (includeActivities && tasks.length > 0) {
      console.log(`🔄 Fetching activities for ${tasks.length} tasks...`);
      const taskIds = tasks.map(task => task.id);
      activities = await getTasksActivities(taskIds);
      
      // Calculate activity statistics
      totalActivities = Array.from(activities.values()).reduce((sum, taskActivities) => sum + taskActivities.length, 0);
      tasksWithActivities = Array.from(activities.values()).filter(taskActivities => taskActivities.length > 0).length;
      
      console.log(`✅ Fetched ${totalActivities} activities across ${tasksWithActivities} tasks`);
    }
    
    // Create export data structure
    const exportData: HeightListExport = {
      list,
      tasks,
      activities,
      exportMetadata: {
        exportedAt: new Date().toISOString(),
        totalTasks: tasks.length,
        completedTasks,
        activeTasks,
        totalActivities,
        tasksWithActivities
      }
    };
    
    // Generate filename
    const safeName = generateSafeFilename(list.name);
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const activitiesSuffix = includeActivities ? '_activities_incl' : '';
    const filename = `${safeName}_${activitiesSuffix}_${timestamp}.json`;
    const filepath = path.join(EXPORT_DIR, filename);
    
    // Convert Map to object for JSON serialization
    const serializableData = {
      ...exportData,
      activities: Object.fromEntries(activities)
    };
    
    // Write to file
    await fs.writeFile(filepath, JSON.stringify(serializableData, null, 2));
    
    return filepath;
  } catch (error) {
    console.error('❌ Error exporting list:', error);
    throw error;
  }
}

// Function to list all exports
export async function listExports(): Promise<string[]> {
  try {
    await ensureExportDir();
    const files = await fs.readdir(EXPORT_DIR);
    return files.filter(file => file.endsWith('.json'));
  } catch (error) {
    console.error('❌ Error listing exports:', error);
    return [];
  }
}

// Function to read an export file
export async function readExport(filename: string): Promise<HeightListExport | null> {
  try {
    const filepath = path.join(EXPORT_DIR, filename);
    const content = await fs.readFile(filepath, 'utf-8');
    const parsed = JSON.parse(content);
    
    // Convert activities object back to Map if it exists
    if (parsed.activities && typeof parsed.activities === 'object' && !(parsed.activities instanceof Map)) {
      parsed.activities = new Map(Object.entries(parsed.activities));
    }
    
    return parsed as HeightListExport;
  } catch (error) {
    console.error('❌ Error reading export:', error);
    return null;
  }
} 