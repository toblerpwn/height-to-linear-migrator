#!/usr/bin/env tsx

import { readHeightLists } from '../height/readLists';

// Get command line arguments
const listId = process.argv[2];

// Run the function with the provided arguments
readHeightLists(listId).catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
}); 