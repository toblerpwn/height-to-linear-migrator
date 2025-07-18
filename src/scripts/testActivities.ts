#!/usr/bin/env tsx

import { getHeightLists } from '../height/readLists';
import { getHeightTasks } from '../height/readTasks';
import { getTasksActivities, getTaskActivitiesSingle } from '../height/readActivities';

async function testActivities(): Promise<void> {
  try {
    console.log('🧪 Testing Height Activities API...\n');
    
    // Get all lists
    console.log('📋 Getting lists...');
    const lists = await getHeightLists();
    console.log(`✅ Found ${lists.length} lists\n`);
    
    if (lists.length === 0) {
      console.log('❌ No lists found. Cannot test activities.');
      return;
    }
    
    // Get tasks from the first list
    const firstList = lists[0];
    console.log(`📋 Getting tasks from "${firstList.name}"...`);
    const tasks = await getHeightTasks(firstList.id);
    console.log(`✅ Found ${tasks.length} tasks\n`);
    
    if (tasks.length === 0) {
      console.log('❌ No tasks found. Cannot test activities.');
      return;
    }
    
    // Test single task activities
    const firstTask = tasks[0];
    console.log(`🔍 Testing single task activities for "${firstTask.name}"...`);
    const singleActivities = await getTaskActivitiesSingle(firstTask.id);
    console.log(`✅ Found ${singleActivities.length} activities for single task\n`);
    
    // Test multiple tasks activities (limited to first 3 for testing)
    const testTasks = tasks.slice(0, 3);
    console.log(`🔍 Testing multiple tasks activities for ${testTasks.length} tasks...`);
    const taskIds = testTasks.map(task => task.id);
    const multipleActivities = await getTasksActivities(taskIds);
    
    console.log('\n📊 Results:');
    testTasks.forEach(task => {
      const activities = multipleActivities.get(task.id) || [];
      console.log(`   ${task.name}: ${activities.length} activities`);
    });
    
    console.log('\n✅ Activities test completed successfully!');
    
  } catch (error) {
    console.error('❌ Activities test failed:', error);
    process.exit(1);
  }
}

// Run the test
testActivities().catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
}); 