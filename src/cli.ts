#!/usr/bin/env tsx

import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';
import boxen from 'boxen';
import figlet from 'figlet';
import { readHeightLists } from './height/readLists';

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
    name: '📋 Read Lists from Height',
    value: 'read-lists',
    description: 'Fetch and display lists from your Height workspace'
  },
  {
    name: '🚪 Exit',
    value: 'exit',
    description: 'Close the application'
  }
];

// List selection options
const listSelectionChoices = [
  {
    name: '📋 All Lists',
    value: 'all',
    description: 'Display all lists from Height'
  },
  {
    name: '🔍 Specific List',
    value: 'specific',
    description: 'Search for a specific list by ID or name'
  },
  {
    name: '⬅️  Back to Main Menu',
    value: 'back',
    description: 'Return to the main menu'
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
    case 'read-lists':
      await handleReadLists();
      break;
    case 'exit':
      console.log(chalk.green('\n👋 Thanks for using Height Migrator!'));
      process.exit(0);
      break;
  }
}

async function handleReadLists(): Promise<void> {
  console.clear();
  
  const { listOption } = await inquirer.prompt([
    {
      type: 'list',
      name: 'listOption',
      message: chalk.cyan('How would you like to read lists?'),
      choices: listSelectionChoices,
      pageSize: 10
    }
  ]);

  switch (listOption) {
    case 'all':
      await readAllLists();
      break;
    case 'specific':
      await readSpecificList();
      break;
    case 'back':
      await showMainMenu();
      return;
  }
}

async function readAllLists(): Promise<void> {
  const spinner = ora(chalk.cyan('📋 Reading all lists from Height...')).start();
  
  try {
    await readHeightLists();
    spinner.succeed(chalk.green('✅ Successfully read all lists!'));
  } catch (error) {
    spinner.fail(chalk.red('❌ Failed to read lists'));
    console.error(chalk.red('Error:'), error);
  }

  await promptContinue();
}

async function readSpecificList(): Promise<void> {
  const { listIdentifier } = await inquirer.prompt([
    {
      type: 'input',
      name: 'listIdentifier',
      message: chalk.cyan('Enter the list ID or name:'),
      validate: (input: string) => {
        if (input.trim().length === 0) {
          return 'Please enter a list ID or name';
        }
        return true;
      }
    }
  ]);

  const spinner = ora(chalk.cyan(`🔍 Searching for list: ${listIdentifier}`)).start();
  
  try {
    await readHeightLists(listIdentifier);
    spinner.succeed(chalk.green('✅ Successfully found and displayed the list!'));
  } catch (error) {
    spinner.fail(chalk.red('❌ Failed to find the list'));
    console.error(chalk.red('Error:'), error);
  }

  await promptContinue();
}

async function promptContinue(): Promise<void> {
  const { continueAction } = await inquirer.prompt([
    {
      type: 'list',
      name: 'continueAction',
      message: chalk.cyan('What would you like to do next?'),
      choices: [
        {
          name: '🔄 Try Another Action',
          value: 'continue'
        },
        {
          name: '🚪 Exit',
          value: 'exit'
        }
      ]
    }
  ]);

  if (continueAction === 'continue') {
    await showMainMenu();
  } else {
    console.log(chalk.green('\n👋 Thanks for using Height Migrator!'));
    process.exit(0);
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