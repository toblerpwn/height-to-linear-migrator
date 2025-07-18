import fs from 'fs/promises';
import path from 'path';
import { HeightTask } from '../height/readTasks';
import { HeightActivity, getTaskActivitiesSingle } from '../height/readActivities';

// Export directory structure
const EXPORT_DIR = 'exports';
const TASKS_EXPORT_DIR = path.join(EXPORT_DIR, 'tasks');

// Ensure export directories exist
async function ensureExportDirs(): Promise<void> {
  try {
    await fs.access(EXPORT_DIR);
  } catch {
    await fs.mkdir(EXPORT_DIR, { recursive: true });
  }
  
  try {
    await fs.access(TASKS_EXPORT_DIR);
  } catch {
    await fs.mkdir(TASKS_EXPORT_DIR, { recursive: true });
  }
}

// Generate a human-friendly slug from task name
function generateTaskSlug(taskName: string): string {
  return taskName
    .replace(/[^a-z0-9\s]/gi, '') // Remove special characters except spaces
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .toLowerCase()
    .substring(0, 30) // Limit to 30 characters
    .replace(/-+$/, ''); // Remove trailing hyphens
}

// Export interface for individual task data
export interface HeightTaskExport {
  task: HeightTask;
  activities: HeightActivity[];
  exportMetadata: {
    exportedAt: string;
    totalActivities: number;
    taskSlug: string;
    taskNumber: string;
  };
}

// Main task export function
export async function exportHeightTask(task: HeightTask, includeActivities: boolean = true): Promise<string> {
  try {
    // Ensure export directories exist
    await ensureExportDirs();
    
    // Get activities if requested
    let activities: HeightActivity[] = [];
    let totalActivities = 0;
    
    if (includeActivities) {
      console.log(`🔄 Fetching activities for task "${task.name}"...`);
      activities = await getTaskActivitiesSingle(task.id);
      totalActivities = activities.length;
      console.log(`✅ Fetched ${totalActivities} activities`);
    }
    
    // Generate human-friendly slug
    const taskSlug = generateTaskSlug(task.name);
    const taskNumber = `T-${task.index}`;
    
    // Create export data structure
    const exportData: HeightTaskExport = {
      task,
      activities,
      exportMetadata: {
        exportedAt: new Date().toISOString(),
        totalActivities,
        taskSlug,
        taskNumber
      }
    };
    
    // Generate filename with human-friendly naming
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const filename = `${taskSlug}_${taskNumber}_${timestamp}.json`;
    const filepath = path.join(TASKS_EXPORT_DIR, filename);
    
    // Write to file
    await fs.writeFile(filepath, JSON.stringify(exportData, null, 2));
    
    return filepath;
  } catch (error) {
    console.error('❌ Error exporting task:', error);
    throw error;
  }
}

// Function to list all task exports
export async function listTaskExports(): Promise<string[]> {
  try {
    await ensureExportDirs();
    const files = await fs.readdir(TASKS_EXPORT_DIR);
    return files.filter(file => file.endsWith('.json'));
  } catch (error) {
    console.error('❌ Error listing task exports:', error);
    return [];
  }
}

// Function to read a task export file
export async function readTaskExport(filename: string): Promise<HeightTaskExport | null> {
  try {
    const filepath = path.join(TASKS_EXPORT_DIR, filename);
    const content = await fs.readFile(filepath, 'utf-8');
    const parsed = JSON.parse(content);
    
    return parsed as HeightTaskExport;
  } catch (error) {
    console.error('❌ Error reading task export:', error);
    return null;
  }
} 