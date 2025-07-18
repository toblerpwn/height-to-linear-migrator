import chalk from 'chalk';
import { HeightList } from '../height/readLists';

function displayCompactList(lists: HeightList[], selectedIndex: number = 0, filterInput: string = ''): void {
  const totalCount = lists.length;
  const filterText = filterInput ? ` (${totalCount} of ${lists.length} total)` : ` (${totalCount} total)`;
  
  console.log(chalk.cyan(`\n📋 Lists${filterText}:\n`));
  
  lists.forEach((list, index) => {
    const status = list.archivedAt ? chalk.gray('(archived)') : chalk.green('(active)');
    const description = list.description ? chalk.gray(` - ${list.description}`) : '';
    
    if (index === selectedIndex) {
      // Highlight selected item
      console.log(`${chalk.cyan('▶')} ${chalk.cyan.bold(list.name)} ${status}${description}`);
    } else {
      console.log(`  ${chalk.white(list.name)} ${status}${description}`);
    }
  });
  console.log('');
}

function displayListDetails(list: HeightList): void {
  console.log(chalk.cyan('\n📋 List Details:\n'));
  console.log(`${chalk.white('Name:')} ${chalk.bold(list.name)}`);
  console.log(`${chalk.white('ID:')} ${list.id}`);
  console.log(`${chalk.white('Type:')} ${list.type}`);
  console.log(`${chalk.white('Created:')} ${new Date(list.createdAt).toLocaleDateString()}`);
  console.log(`${chalk.white('Updated:')} ${new Date(list.updatedAt).toLocaleDateString()}`);
  console.log(`${chalk.white('Status:')} ${list.archivedAt ? chalk.red('Archived') : chalk.green('Active')}`);
  
  if (list.description) {
    console.log(`${chalk.white('Description:')} ${list.description}`);
  }
  
  console.log(`${chalk.white('URL:')} ${chalk.blue(list.url)}`);
  console.log(`${chalk.white('Tasks:')} ${list.fieldsSummaries?.name?.count || 0} items`);
  console.log('');
}

function clearScreen(): void {
  console.clear();
}

function renderInteractiveList(lists: HeightList[], filteredLists: HeightList[], selectedIndex: number, filterInput: string): void {
  clearScreen();
  
  if (filterInput) {
    console.log(chalk.cyan(`\n🔍 Filter: "${filterInput}"`));
  } else {
    console.log(chalk.cyan('\n📋 All Lists'));
  }
  
  displayCompactList(filteredLists, selectedIndex, filterInput);
  
  let instructions = 'Filter: Type | Exit: Ctrl+C';
  if (filterInput) {
    const prefix = 'Navigation: ↑↓ arrows | Selection: ENTER | ';
    instructions = prefix + instructions;
  }
  
  // Show instructions
  console.log(chalk.gray(instructions));
}

export async function selectList(lists: HeightList[]): Promise<HeightList | null> {
  let filteredLists = [...lists];
  let filterInput = '';
  let selectedIndex = 0;
  let currentInput = '';
  
  // Set up raw mode for immediate input handling
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  
  renderInteractiveList(lists, filteredLists, selectedIndex, filterInput);
  
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
          renderInteractiveList(lists, filteredLists, selectedIndex, filterInput);
        }
        return;
      }
      
      if (buffer === '\u001b[B') { // Down arrow
        buffer = '';
        if (selectedIndex < filteredLists.length - 1) {
          selectedIndex++;
          renderInteractiveList(lists, filteredLists, selectedIndex, filterInput);
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
        if (filteredLists.length > 0) {
          const selectedList = filteredLists[selectedIndex];
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdin.removeListener('data', handleInput);
          displayListDetails(selectedList);
          resolve(selectedList);
          return;
        }
        return;
      }
      
      if (buffer === '\u007f') { // Backspace
        buffer = '';
        if (currentInput.length > 0) {
          currentInput = currentInput.slice(0, -1);
          filterInput = currentInput;
          filteredLists = currentInput 
            ? lists.filter(list => 
                list.name.toLowerCase().includes(currentInput.toLowerCase()) ||
                (list.description && list.description.toLowerCase().includes(currentInput.toLowerCase()))
              )
            : [...lists];
          selectedIndex = Math.min(selectedIndex, filteredLists.length - 1);
          renderInteractiveList(lists, filteredLists, selectedIndex, filterInput);
        }
        return;
      }
      
      // Regular character input (printable characters)
      if (buffer.length === 1 && buffer.charCodeAt(0) >= 32 && buffer.charCodeAt(0) <= 126) {
        const char = buffer;
        buffer = '';
        currentInput += char;
        filterInput = currentInput;
        filteredLists = lists.filter(list => 
          list.name.toLowerCase().includes(currentInput.toLowerCase()) ||
          (list.description && list.description.toLowerCase().includes(currentInput.toLowerCase()))
        );
        selectedIndex = 0; // Reset to first item when filtering
        renderInteractiveList(lists, filteredLists, selectedIndex, filterInput);
      }
    };
    
    process.stdin.on('data', handleInput);
    
    // Clean up when done
    process.on('exit', () => {
      process.stdin.removeListener('data', handleInput);
    });
  });
} 