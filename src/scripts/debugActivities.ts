#!/usr/bin/env tsx

import Height from 'height-app-api';
import { heightConfig } from '../utils/config';
import { getTasksActivities } from '../height/readActivities';

async function debugActivities(): Promise<void> {
  try {
    console.log('🔍 Debugging Height Activities API...\n');
    
    // Initialize Height client
    const height = new Height({ secretKey: heightConfig.apiToken });
    
    // First, let's get a list and a task
    console.log('📋 Getting lists...');
    const { list: lists } = await height.lists.all();
    console.log(`✅ Found ${lists?.length || 0} lists`);
    
    if (!lists || lists.length === 0) {
      console.log('❌ No lists found');
      return;
    }
    
    const firstList = lists[0];
    console.log(`📋 Getting tasks from "${(firstList as any).name}"...`);
    
    const { list: tasks } = await height.tasks.search({
      filters: {
        listIds: {
          values: [(firstList as any).id]
        }
      }
    });
    
    console.log(`✅ Found ${tasks?.length || 0} tasks`);
    
    if (!tasks || tasks.length === 0) {
      console.log('❌ No tasks found');
      return;
    }
    
    const firstTask = tasks[0];
    console.log(`🔍 Testing activities for task: ${(firstTask as any).name} (${(firstTask as any).id})`);
    
    // Try the activities API call
    console.log('🔄 Calling height.activities.get()...');
    const startTime = Date.now();
    
    try {
      const activitiesResponse = await height.activities.get({
        taskId: (firstTask as any).id
      });
      
      const endTime = Date.now();
      console.log(`✅ Activities call completed in ${endTime - startTime}ms`);
      console.log('Response structure:', Object.keys(activitiesResponse));
      
      if (activitiesResponse.list) {
        console.log(`✅ Found ${activitiesResponse.list.length} activities`);
        if (activitiesResponse.list.length > 0) {
          console.log('First activity:', activitiesResponse.list[0]);
        }
      } else {
        console.log('⚠️  No list property in response');
              console.log('Full response:', activitiesResponse);
    }
    
  } catch (error) {
    const endTime = Date.now();
    console.log(`❌ Activities call failed after ${endTime - startTime}ms`);
    console.error('Error:', error);
  }
  
  // Test PromisePool with multiple tasks
  console.log('\n🧪 Testing PromisePool with multiple tasks...');
  const testTaskIds = tasks.slice(0, 3).map((task: any) => task.id);
  console.log(`Testing with ${testTaskIds.length} tasks:`, testTaskIds);
  
  try {
    const startTime = Date.now();
    const activitiesMap = await getTasksActivities(testTaskIds);
    const endTime = Date.now();
    
    console.log(`✅ PromisePool test completed in ${endTime - startTime}ms`);
    console.log('Results:');
    activitiesMap.forEach((activities, taskId) => {
      console.log(`   Task ${taskId}: ${activities.length} activities`);
    });
    
  } catch (error) {
    console.error('❌ PromisePool test failed:', error);
  }
  
} catch (error) {
  console.error('❌ Debug failed:', error);
}
}

// Run the debug
debugActivities().catch((error) => {
  console.error('❌ Debug failed:', error);
  process.exit(1);
}); 