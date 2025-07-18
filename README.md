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

### Available Scripts

```bash
# Start the main application
npm start

# Run in development mode with file watching
npm run dev

# Read all lists from Height
npm run read

# Read a specific list by ID or name
npm run read "engineering"
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
├── index.ts              # Main entry point
├── readLists.ts          # Read lists from Height
└── migrate.ts            # Full migration script
```

## Dependencies

- **tsx**: Fast TypeScript execution
- **@linear/sdk**: Official Linear SDK
- **height-api**: Unofficial Height SDK
- **dotenv**: Environment variable loading
- **zod**: Runtime type validation

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