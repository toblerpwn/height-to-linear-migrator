import chalk from 'chalk';
import ora from 'ora';
import { getHeightTasks, HeightTask } from '../height/readTasks';

function displayCompactTasks(tasks: HeightTask[], selectedIndex: number = 0, filterInput: string = ''): void {
  const totalCount = tasks.length;
  const filterText = filterInput ? ` (${totalCount} of ${tasks.length} total)` : ` (${totalCount} total)`;
  
  console.log(chalk.cyan(`\n📋 Tasks${filterText}:\n`));
  
  tasks.forEach((task, index) => {
    const status = task.completed ? chalk.green('(completed)') : chalk.yellow('(active)');
    const taskNumber = chalk.gray(`T-${task.index}`);
    const description = task.description ? chalk.gray(` - ${task.description.substring(0, 50)}${task.description.length > 50 ? '...' : ''}`) : '';
    
    if (index === selectedIndex) {
      // Highlight selected item
      console.log(`${chalk.cyan('▶')} ${chalk.cyan.bold(task.name)} ${taskNumber} ${status}${description}`);
    } else {
      console.log(`  ${chalk.white(task.name)} ${taskNumber} ${status}${description}`);
    }
  });
  console.log('');
}

function displayTaskDetails(task: HeightTask): void {
  console.log(chalk.cyan('\n📋 Task Details:\n'));
  console.log(`${chalk.white('Name:')} ${chalk.bold(task.name)}`);
  console.log(`${chalk.white('ID:')} ${task.id}`);
  console.log(`${chalk.white('Task Number:')} T-${task.index}`);
  console.log(`${chalk.white('Status:')} ${task.status}`);
  console.log(`${chalk.white('Created:')} ${new Date(task.createdAt).toLocaleDateString()}`);
  console.log(`${chalk.white('Last Activity:')} ${new Date(task.lastActivityAt).toLocaleDateString()}`);
  console.log(`${chalk.white('Completed:')} ${task.completed ? chalk.green('Yes') : chalk.red('No')}`);
  
  if (task.completed) {
    console.log(`${chalk.white('Completed At:')} ${new Date(task.completedAt).toLocaleDateString()}`);
  }
  
  if (task.description) {
    console.log(`${chalk.white('Description:')} ${task.description}`);
  }
  
  console.log(`${chalk.white('URL:')} ${chalk.blue(task.url)}`);
  console.log(`${chalk.white('Assignees:')} ${task.assigneesIds.length > 0 ? task.assigneesIds.join(', ') : 'None'}`);
  console.log(`${chalk.white('Lists:')} ${task.listIds.length > 0 ? task.listIds.join(', ') : 'None'}`);
  console.log('');
}

function clearScreen(): void {
  console.clear();
}

function renderInteractiveTasks(tasks: HeightTask[], filteredTasks: HeightTask[], selectedIndex: number, filterInput: string): void {
  clearScreen();
  
  if (filterInput) {
    console.log(chalk.cyan(`\n🔍 Filter: "${filterInput}"`));
  } else {
    console.log(chalk.cyan('\n📋 All Tasks'));
  }
  
  displayCompactTasks(filteredTasks, selectedIndex, filterInput);
  
  let instructions = 'Filter: Type | Exit: Ctrl+C';
  if (filterInput) {
    const prefix = 'Navigation: ↑↓ arrows | Selection: ENTER | ';
    instructions = prefix + instructions;
  }
  
  // Show instructions
  console.log(chalk.gray(instructions));
}

async function selectTask(tasks: HeightTask[]): Promise<void> {
  let filteredTasks = [...tasks];
  let filterInput = '';
  let selectedIndex = 0;
  let currentInput = '';
  
  // Set up raw mode for immediate input handling
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  
  renderInteractiveTasks(tasks, filteredTasks, selectedIndex, filterInput);
  
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
          renderInteractiveTasks(tasks, filteredTasks, selectedIndex, filterInput);
        }
        return;
      }
      
      if (buffer === '\u001b[B') { // Down arrow
        buffer = '';
        if (selectedIndex < filteredTasks.length - 1) {
          selectedIndex++;
          renderInteractiveTasks(tasks, filteredTasks, selectedIndex, filterInput);
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
        if (filteredTasks.length > 0) {
          const selectedTask = filteredTasks[selectedIndex];
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdin.removeListener('data', handleInput);
          displayTaskDetails(selectedTask);
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
          filteredTasks = currentInput 
            ? tasks.filter(task => 
                task.name.toLowerCase().includes(currentInput.toLowerCase()) ||
                (task.description && task.description.toLowerCase().includes(currentInput.toLowerCase()))
              )
            : [...tasks];
          selectedIndex = Math.min(selectedIndex, filteredTasks.length - 1);
          renderInteractiveTasks(tasks, filteredTasks, selectedIndex, filterInput);
        }
        return;
      }
      
      // Regular character input (printable characters)
      if (buffer.length === 1 && buffer.charCodeAt(0) >= 32 && buffer.charCodeAt(0) <= 126) {
        const char = buffer;
        buffer = '';
        currentInput += char;
        filterInput = currentInput;
        filteredTasks = tasks.filter(task => 
          task.name.toLowerCase().includes(currentInput.toLowerCase()) ||
          (task.description && task.description.toLowerCase().includes(currentInput.toLowerCase()))
        );
        selectedIndex = 0; // Reset to first item when filtering
        renderInteractiveTasks(tasks, filteredTasks, selectedIndex, filterInput);
      }
    };
    
    process.stdin.on('data', handleInput);
    
    // Clean up when done
    process.on('exit', () => {
      process.stdin.removeListener('data', handleInput);
    });
  });
}

export async function browseTasks(listId: string, listName: string): Promise<void> {
  console.clear();
  
  // Immediately fetch all tasks for the list
  const spinner = ora(chalk.cyan(`📋 Loading tasks for "${listName}"...`)).start();
  
  try {
    const tasks = await getHeightTasks(listId);
    spinner.succeed(chalk.green(`✅ Loaded ${tasks.length} tasks`));
    
    if (tasks.length === 0) {
      console.log(chalk.yellow('\n⚠️  No tasks found. This could mean:'));
      console.log(chalk.gray('   - No tasks exist in this list'));
      console.log(chalk.gray('   - API token doesn\'t have access to tasks'));
      console.log(chalk.gray('   - List ID is incorrect\n'));
      return;
    }
    
    // Allow user to filter and select
    await selectTask(tasks);
    
  } catch (error) {
    spinner.fail(chalk.red('❌ Failed to load tasks'));
    console.error(chalk.red('Error:'), error);
  }
} 