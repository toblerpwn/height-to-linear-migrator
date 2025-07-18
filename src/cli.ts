#!/usr/bin/env tsx

import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';
import boxen from 'boxen';
import figlet from 'figlet';
import { getHeightLists, HeightList } from './height/readLists';
import { selectList } from './cli/listBrowser';
import { browseTasks } from './cli/taskBrowser';

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
    const selectedList = await selectList(lists);
    if (selectedList) {
      await promptListActions(selectedList);
    } else {
      await promptContinue();
    }
    
  } catch (error) {
    spinner.fail(chalk.red('❌ Failed to load lists'));
    console.error(chalk.red('Error:'), error);
    await promptContinue();
  }
}

async function promptListActions(selectedList: HeightList): Promise<void> {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: chalk.cyan('What would you like to do with this list?'),
      choices: [
        {
          name: `📋 Browse Tasks for "${selectedList.name}"`,
          value: 'browse-tasks',
          description: 'View and search through all tasks in this list'
        },
        {
          name: '⬅️  Back to List Browser',
          value: 'browse-lists'
        },
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

  switch (action) {
    case 'browse-tasks':
      await browseTasks(selectedList.id, selectedList.name);
      await promptContinue();
      break;
    case 'browse-lists':
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