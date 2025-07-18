#!/usr/bin/env tsx

import Height from 'height-app-api';
import { heightConfig } from '../utils/config';

// Get command line arguments
const listId = process.argv[2];

function logListDetails(list: any, isListItem: boolean = false): void {
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

async function readHeightLists(): Promise<void> {
  try {
    // Initialize Height client
    const height = new Height({ secretKey: heightConfig.apiToken });
    
    // Get all lists (there is no API to get a specific list, so we always need all)
    console.log('📋 Reading all Lists from Height...');
    const { list: listOfLists } = await height.lists.all();
    
    if (listId) {
      console.log(`📋 Finding specific list: ${listId}`);
      
      const list = listOfLists?.find((l: any) => l.id === listId || l.name === listId);
      
      if (list) {
        console.log('✅ Found list in Height');
        console.log('');
        logListDetails(list);
        console.log('🔍 Debug: List details:', list);
      } else {
        console.log(`❌ List with ID/name "${listId}" not found`);
        console.log('Available lists:');
        listOfLists?.forEach((l: any, index: number) => {
          console.log(`  ${index + 1}. ${l.name} (ID: ${l.id})`);
        });
      }
    } else {
      
      // Get all lists
      const { list: listOfLists } = await height.lists.all();
        
      console.log(`✅ Found ${listOfLists?.length} lists in Height`);
      console.log('');
      
      if (listOfLists?.length === 0) {
        console.log('⚠️  No lists found. This could mean:');
        console.log('   - No lists exist in your Height workspace');
        console.log('   - API token doesn\'t have access to lists');
        console.log('   - Different API endpoint structure');
        console.log('');
      } else {
        listOfLists?.forEach((list: any, index: number) => {
          console.log(`${index + 1}. ${list.name}`);
          logListDetails(list, true);
        });
      }
    }

  } catch (error) {
    console.error('❌ Error reading lists from Height:', error);
    process.exit(1);
  }
}

// Run the script
readHeightLists(); 