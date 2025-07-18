import chalk from 'chalk';
import ora from 'ora';
import { HeightActivity, getTaskActivitiesSingle } from '../height/readActivities';

function displayCompactActivities(activities: HeightActivity[], selectedIndex: number = 0, filterInput: string = ''): void {
  const totalCount = activities.length;
  const filterText = filterInput ? ` (${totalCount} of ${activities.length} total)` : ` (${totalCount} total)`;
  
  console.log(chalk.cyan(`\n📝 Activities${filterText}:\n`));
  
  activities.forEach((activity, index) => {
    const activityType = chalk.gray(`[${activity.type}]`);
    const date = chalk.gray(new Date(activity.createdAt).toLocaleDateString());
    const user = chalk.gray(activity.createdUserId);
    
    if (index === selectedIndex) {
      // Highlight selected item
      console.log(`${chalk.cyan('▶')} ${chalk.cyan.bold(activityType)} ${date} by ${user}`);
    } else {
      console.log(`  ${chalk.white(activityType)} ${date} by ${user}`);
    }
  });
  console.log('');
}

function displayActivityDetails(activity: HeightActivity): void {
  console.log(chalk.cyan('\n📝 Activity Details:\n'));
  console.log(`${chalk.white('ID:')} ${activity.id}`);
  console.log(`${chalk.white('Type:')} ${chalk.bold(activity.type)}`);
  console.log(`${chalk.white('Created:')} ${new Date(activity.createdAt).toLocaleString()}`);
  console.log(`${chalk.white('User:')} ${activity.createdUserId}`);
  console.log(`${chalk.white('Task ID:')} ${activity.taskId}`);
  
  if (activity.data) {
    console.log(`${chalk.white('Data:')}`);
    console.log(chalk.gray(JSON.stringify(activity.data, null, 2)));
  }
  
  console.log('');
}

function clearScreen(): void {
  console.clear();
}

function renderInteractiveActivities(activities: HeightActivity[], filteredActivities: HeightActivity[], selectedIndex: number, filterInput: string): void {
  clearScreen();
  
  if (filterInput) {
    console.log(chalk.cyan(`\n🔍 Filter: "${filterInput}"`));
  } else {
    console.log(chalk.cyan('\n📝 All Activities'));
  }
  
  displayCompactActivities(filteredActivities, selectedIndex, filterInput);
  
  let instructions = 'Filter: Type | Exit: Ctrl+C';
  if (filterInput) {
    const prefix = 'Navigation: ↑↓ arrows | Selection: ENTER | ';
    instructions = prefix + instructions;
  }
  
  // Show instructions
  console.log(chalk.gray(instructions));
}

async function selectActivity(activities: HeightActivity[]): Promise<void> {
  let filteredActivities = [...activities];
  let filterInput = '';
  let selectedIndex = 0;
  let currentInput = '';
  
  // Set up raw mode for immediate input handling
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  
  renderInteractiveActivities(activities, filteredActivities, selectedIndex, filterInput);
  
  return new Promise((resolve) => {
    let buffer = '';
    
    const handleInput = (data: Buffer) => {
      const input = data.toString();
      buffer += input;
      
      // Handle special keys
      if (input === '\u0003') { // Ctrl+C
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdin.removeListener('data', handleInput);
        process.exit(0);
      }
      
      // Check for arrow key sequences
      if (buffer === '\u001b[A') { // Up arrow
        buffer = '';
        if (selectedIndex > 0) {
          selectedIndex--;
          renderInteractiveActivities(activities, filteredActivities, selectedIndex, filterInput);
        }
        return;
      }
      
      if (buffer === '\u001b[B') { // Down arrow
        buffer = '';
        if (selectedIndex < filteredActivities.length - 1) {
          selectedIndex++;
          renderInteractiveActivities(activities, filteredActivities, selectedIndex, filterInput);
        }
        return;
      }
      
      // Clear buffer for any other escape sequences
      if (buffer.startsWith('\u001b')) {
        buffer = '';
        return;
      }
      
      if (buffer === '\r' || buffer === '\n') { // Enter
        buffer = '';
        if (filteredActivities.length > 0) {
          const selectedActivity = filteredActivities[selectedIndex];
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdin.removeListener('data', handleInput);
          displayActivityDetails(selectedActivity);
          resolve();
          return;
        }
        return;
      }
      
      if (buffer === '\u007f') { // Backspace
        buffer = '';
        if (currentInput.length > 0) {
          currentInput = currentInput.slice(0, -1);
          filterInput = currentInput;
          filteredActivities = currentInput 
            ? activities.filter(activity => 
                activity.type.toLowerCase().includes(currentInput.toLowerCase()) ||
                activity.createdUserId.toLowerCase().includes(currentInput.toLowerCase())
              )
            : [...activities];
          selectedIndex = Math.min(selectedIndex, filteredActivities.length - 1);
          renderInteractiveActivities(activities, filteredActivities, selectedIndex, filterInput);
        }
        return;
      }
      
      // Regular character input (printable characters)
      if (buffer.length === 1 && buffer.charCodeAt(0) >= 32 && buffer.charCodeAt(0) <= 126) {
        const char = buffer;
        buffer = '';
        currentInput += char;
        filterInput = currentInput;
        filteredActivities = activities.filter(activity => 
          activity.type.toLowerCase().includes(currentInput.toLowerCase()) ||
          activity.createdUserId.toLowerCase().includes(currentInput.toLowerCase())
        );
        selectedIndex = 0; // Reset to first item when filtering
        renderInteractiveActivities(activities, filteredActivities, selectedIndex, filterInput);
      }
    };
    
    process.stdin.on('data', handleInput);
    
    // Clean up when done
    process.on('exit', () => {
      process.stdin.removeListener('data', handleInput);
    });
  });
}

export async function browseActivities(taskId: string, taskName: string): Promise<void> {
  console.clear();
  
  // Immediately fetch all activities for the task
  const spinner = ora(chalk.cyan(`📝 Loading activities for "${taskName}"...`)).start();
  
  try {
    const activities = await getTaskActivitiesSingle(taskId);
    spinner.succeed(chalk.green(`✅ Loaded ${activities.length} activities`));
    
    if (activities.length === 0) {
      console.log(chalk.yellow('\n⚠️  No activities found. This could mean:'));
      console.log(chalk.gray('   - No activities exist for this task'));
      console.log(chalk.gray('   - API token doesn\'t have access to activities'));
      console.log(chalk.gray('   - Task ID is incorrect\n'));
      return;
    }
    
    // Allow user to filter and select
    await selectActivity(activities);
    
  } catch (error) {
    spinner.fail(chalk.red('❌ Failed to load activities'));
    console.error(chalk.red('Error:'), error);
  }
} 