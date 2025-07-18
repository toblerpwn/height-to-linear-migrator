#!/usr/bin/env tsx

import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';
import boxen from 'boxen';
import figlet from 'figlet';
import { getHeightLists, getHeightList, HeightList } from './height/readLists';
import * as readline from 'readline';

// ASCII art title
const title = figlet.textSync('Height to Linear', {
  font: 'Slant',
  horizontalLayout: 'default',
  verticalLayout: 'default',
  width: 100,
  whitespaceBreak: true
});

// Welcome message
const welcomeMessage = boxen(
  chalk.cyan(title) + '\n\n' +
  chalk.gray('Migrate your data from Height to Linear with ease') + '\n' +
  chalk.gray('Select an option below to get started'),
  {
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'cyan'
  }
);

// Main menu options
const mainMenuChoices = [
  {
    name: '📋 Browse Height Lists',
    value: 'browse-lists',
    description: 'View and search through all lists in your Height workspace'
  },
  {
    name: '🚪 Exit',
    value: 'exit',
    description: 'Close the application'
  }
];

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
  
  // Show instructions
  console.log(chalk.gray('Navigation: ↑↓ arrows | Selection: ENTER | Filter: Type | Exit: Ctrl+C'));
}

async function selectList(lists: HeightList[]): Promise<void> {
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
          displayListDetails(selectedList);
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

async function showMainMenu(): Promise<void> {
  console.clear();
  console.log(welcomeMessage);

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: chalk.cyan('What would you like to do?'),
      choices: mainMenuChoices,
      pageSize: 10
    }
  ]);

  switch (action) {
    case 'browse-lists':
      await browseLists();
      break;
    case 'exit':
      console.log(chalk.green('\n👋 Thanks for using Height Migrator!'));
      process.exit(0);
      break;
  }
}

async function browseLists(): Promise<void> {
  console.clear();
  
  // Immediately fetch all lists
  const spinner = ora(chalk.cyan('📋 Loading lists from Height...')).start();
  
  try {
    const lists = await getHeightLists();
    spinner.succeed(chalk.green(`✅ Loaded ${lists.length} lists`));
    
    if (lists.length === 0) {
      console.log(chalk.yellow('\n⚠️  No lists found. This could mean:'));
      console.log(chalk.gray('   - No lists exist in your Height workspace'));
      console.log(chalk.gray('   - API token doesn\'t have access to lists'));
      console.log(chalk.gray('   - Different API endpoint structure\n'));
      await promptContinue();
      return;
    }
    
    // Allow user to filter and select
    await selectList(lists);
    await promptContinue();
    
  } catch (error) {
    spinner.fail(chalk.red('❌ Failed to load lists'));
    console.error(chalk.red('Error:'), error);
    await promptContinue();
  }
}

async function promptContinue(): Promise<void> {
  const { continueAction } = await inquirer.prompt([
    {
      type: 'list',
      name: 'continueAction',
      message: chalk.cyan('What would you like to do next?'),
      choices: [
        {
          name: '⬅️  Back to Main Menu',
          value: 'menu'
        },
        {
          name: '🚪 Exit',
          value: 'exit'
        }
      ]
    }
  ]);

  switch (continueAction) {
    case 'browse':
      await browseLists();
      break;
    case 'menu':
      await showMainMenu();
      break;
    case 'exit':
      console.log(chalk.green('\n👋 Thanks for using Height Migrator!'));
      process.exit(0);
      break;
  }
}

// Error handling
process.on('unhandledRejection', (error) => {
  console.error(chalk.red('❌ Unhandled error:'), error);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log(chalk.green('\n👋 Thanks for using Height Migrator!'));
  process.exit(0);
});

// Start the CLI
showMainMenu().catch((error) => {
  console.error(chalk.red('❌ Fatal error:'), error);
  process.exit(1);
}); 