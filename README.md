# Height to Linear Migrator

A TypeScript project using [tsx](https://tsx.is/getting-started) to migrate data from Height to Linear.

## Features

- 🚀 Fast execution with tsx (no build step required)
- 🔄 Migration pipeline from Height to Linear
- ✅ Environment validation with Zod
- 🛡️ TypeScript for type safety

## Prerequisites

- Node.js 18+ 
- Height API token
- Linear API key

## Setup

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` and add your API credentials:
   ```env
   HEIGHT_API_TOKEN=your_height_api_token_here
   LINEAR_API_KEY=your_linear_api_key_here
   LINEAR_WORKSPACE_ID=your_linear_workspace_id_here  # Optional
   ```

3. **Get your API credentials:**

   **Height API Token:**
   - Go to Height settings → API
   - Generate a new API token
   - Copy the token to your `.env` file

   **Linear API Key:**
   - Go to Linear settings → API
   - Create a new API key
   - Copy the key to your `.env` file

## Usage

### Interactive CLI

The project includes a beautiful interactive CLI for easy navigation:

```bash
# Start the interactive CLI
npm run cli
# or
npm start
```

The CLI provides:
- 🎨 Beautiful ASCII art interface
- 📋 Interactive menus with descriptions
- ⏳ Visual loading spinners
- 🎯 Easy navigation between options
- 🔍 Search for specific lists by ID or name
- 📊 View all lists from your Height workspace

### Available Scripts

```bash
# Start the interactive CLI
npm start
npm run cli

# Run the original direct script
npm run heightReadLists

# Read a specific list by ID or name (direct)
npm run heightReadLists "engineering"
```

### Getting Started

1. **Run the main application:**
   ```bash
   npm start
   ```

2. **Run in development mode:**
   ```bash
   npm run dev
   ```

3. **Read Height data:**
   ```bash
   npm run read
   npm run read "engineering"  # Read specific list
   ```

## Project Structure

```
src/
├── cli.ts                # Interactive CLI interface
├── height/
│   └── readLists.ts      # Height list reading functionality (module)
├── scripts/
│   └── heightReadLists.ts # Script wrapper for direct execution
├── linear/               # Linear integration (coming soon)
└── utils/
    └── config.ts         # Configuration and environment setup
```

## Dependencies

- **tsx**: Fast TypeScript execution
- **@linear/sdk**: Official Linear SDK
- **height-app-api**: Unofficial Height SDK
- **dotenv**: Environment variable loading
- **zod**: Runtime type validation

### CLI Dependencies

- **inquirer**: Interactive command line interface
- **ora**: Elegant terminal spinners
- **chalk**: Terminal string styling
- **boxen**: Create boxes in the terminal
- **figlet**: ASCII art text

## Development

The project uses:
- **TypeScript** for type safety
- **ES modules** for modern JavaScript
- **tsx** for fast development without build steps
- **Zod** for runtime validation

## Next Steps

1. ✅ Project skeleton created
2. 🔄 Implement migration scripts as needed
3. 🔄 Add error handling and retry logic
4. 🔄 Add progress tracking and logging
5. 🔄 Add dry-run mode for testing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT 