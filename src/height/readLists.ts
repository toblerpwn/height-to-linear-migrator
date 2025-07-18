import Height from 'height-app-api';
import { heightConfig } from '../utils/config';

// Define the list type based on Height API response
// (NOTE: this is more correct/complete than Height's ListObject type!)
export interface HeightList {
  id: string;
  name: string;
  description?: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
  model: string;
  teamId: string;
  archivedBy?: string;
  filters: any;
  fields: any[];
  fieldsSummaries: any;
  sectionsSummaries: any;
  sortBy: any;
  viewBy?: any;
  subviewBy?: any;
  viewByMobile?: any;
  subviewByMobile?: any;
  visualization: string;
  key: string;
  userId: string;
  reserved: boolean;
  showCompletedTasks: string;
  showCompletedTasksCustomFilter?: any;
  subtaskHierarchy: string;
  appearance: any;
  updatedBy: string;
  defaultList: boolean;
  url: string;
  topActiveUsersIds: string[];
  totalActiveUsersCount: number;
  calendarVisualizationOptions: any;
  ganttVisualizationOptions: any;
  customToolbar: any[];
  searchTopResultCount: number;
  searchHighlightMode: string;
  memberAccess: string;
  publicAccess?: any;
  rootTaskId?: any;
  notificationsSubscriptions: any[];
  subscribersIds: string[];
  [key: string]: any; // For any other properties
}

function logListDetails(list: HeightList, isListItem: boolean = false): void {
  const prefix = isListItem ? '   ' : '';
  console.log(`${prefix}ID: ${list.id}`);
  if (list.description) {
    console.log(`${prefix}Description: ${list.description}`);
  }
  if (!isListItem) {
    console.log(`${prefix}Type: ${list.type}`);
  } else {
    console.log(`${prefix}Created: ${new Date(list.createdAt).toLocaleDateString()}`);
    console.log('');
  }
}

// New function that returns the lists data
export async function getHeightLists(): Promise<HeightList[]> {
  try {
    // Initialize Height client
    const height = new Height({ secretKey: heightConfig.apiToken });
    
    // Get all lists
    const { list: listOfLists } = await height.lists.all();
    
    if (!listOfLists || listOfLists.length === 0) {
      return [];
    }
    
    return listOfLists as HeightList[];
  } catch (error) {
    console.error('❌ Error reading lists from Height:', error);
    throw error;
  }
}

// Function to get a specific list by ID or name
export async function getHeightList(listId: string): Promise<HeightList | null> {
  const lists = await getHeightLists();
  return lists.find((l) => l.id === listId || l.name === listId) || null;
}

export async function readHeightLists(listId?: string): Promise<void> {
  try {
    if (listId) {
      console.log(`📋 Finding specific list: ${listId}`);
      
      const list = await getHeightList(listId);
      
      if (list) {
        console.log('✅ Found list in Height');
        console.log('');
        logListDetails(list);
        console.log('🔍 Debug: List details:', list);
      } else {
        console.log(`❌ List with ID/name "${listId}" not found`);
        const lists = await getHeightLists();
        console.log('Available lists:');
        lists.forEach((l, index) => {
          console.log(`  ${index + 1}. ${l.name} (ID: ${l.id})`);
        });
      }
    } else {
      console.log('📋 Reading all Lists from Height...');
      const lists = await getHeightLists();
        
      console.log(`✅ Found ${lists.length} lists in Height`);
      console.log('');
      
      if (lists.length === 0) {
        console.log('⚠️  No lists found. This could mean:');
        console.log('   - No lists exist in your Height workspace');
        console.log('   - API token doesn\'t have access to lists');
        console.log('   - Different API endpoint structure');
        console.log('');
      } else {
        lists.forEach((list, index) => {
          console.log(`${index + 1}. ${list.name}`);
          logListDetails(list, true);
        });
      }
    }

  } catch (error) {
    console.error('❌ Error reading lists from Height:', error);
    throw error;
  }
}

 