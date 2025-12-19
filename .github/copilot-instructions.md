# イカ部 Discord Bot (ikabu)

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the information here.

## Working Effectively

### Bootstrap, Build, and Test
- Install system dependencies for canvas package (requires native compilation):
  - `sudo apt-get update && sudo apt-get install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev libpixman-1-dev`
- Install Node.js dependencies:
  - `npm install` -- takes 45 seconds. NEVER CANCEL. Set timeout to 120+ seconds.
- Setup environment file:
  - `cp .env.sample .env` and configure required Discord bot credentials
- Build process (**NETWORK DEPENDENT**):
  - `npm run compile` -- runs `prisma generate && tsc -p . && prisma migrate deploy`
  - **CRITICAL**: Prisma generate requires network access to download binaries from https://binaries.prisma.sh
  - **LIMITATION**: Build may fail in environments without internet access due to Prisma engine downloads
  - If Prisma fails, document as "Build fails due to network restrictions for Prisma engine downloads"
- Linting and code quality:
  - `npm run lint` -- takes 9 seconds. Runs ESLint and Prettier validation
  - `npm run fix` -- takes 11 seconds. Auto-fixes linting issues

### Running the Application
- **CANNOT RUN WITHOUT DISCORD CREDENTIALS**: The bot requires valid Discord bot token and server ID
- Start the bot: `npm start` (runs compile then starts with dotenv config)
- **HTTP Health Check**: Bot runs an HTTP server on port 3000 for uptime monitoring
- **WARNING**: Do not attempt to run without proper .env configuration as it will fail on Discord login

### Database Operations
- Database: SQLite with Prisma ORM
- Generate Prisma client: `npx prisma generate` (requires network access)
- Run migrations (development): `npm run migrate-dev`
- Deploy migrations (production): `npm run migrate-deploy`
- **CRITICAL**: Database operations depend on successful Prisma client generation

## Validation and Testing
- **NO UNIT TESTS**: The test directory contains only a dummy file
- **MANUAL VALIDATION REQUIRED**: Since this is a Discord bot, validate changes by:
  1. Ensuring code compiles without TypeScript errors
  2. Running linting to check code quality
  3. Reviewing Discord.js interactions and command definitions
  4. Testing bot commands in a Discord server with proper credentials
- Always run `npm run lint` and `npm run fix` before committing
- **NEVER CANCEL**: Allow builds and lint operations to complete fully

## Important Codebase Locations

### Entry Points
- **Main server**: `src/server.ts` - HTTP server for health checks
- **Bot entry**: `src/app/index.ts` - Discord bot implementation and event handlers
- **Command registration**: `src/register.ts` - Slash command definitions

### Key Directories
- `src/app/feat-recruit/` - Discord recruitment system (main feature)
- `src/app/feat-admin/` - Admin commands and channel/role management
- `src/app/feat-utils/` - Utility commands (team divider, voice tools, etc.)
- `src/app/handlers/` - Discord event handlers (button, command, modal, message)
- `src/app/common/` - Shared utilities, API clients, and managers
- `src/db/` - Database service layer for Prisma operations
- `prisma/` - Database schema and migrations

### Configuration Files
- `.env` - Environment variables (Discord tokens, server IDs, API keys)
- `config/log4js-console-config.json` - Logging configuration
- `tsconfig.json` - TypeScript compiler settings
- `.eslintrc.js` - ESLint and Prettier configuration

## Technologies and Dependencies
- **Runtime**: Node.js 20.19.5 (project specifies 16.13.0 minimum)
- **Language**: TypeScript 5.1.3
- **Framework**: Discord.js 14.15.1
- **Database**: SQLite with Prisma 5.13.0
- **Build Tools**: ESLint, Prettier, TypeScript compiler
- **Native Dependencies**: Canvas 2.10.2 (requires system build tools)

## Development Workflow

### Common Commands Reference
```bash
# Complete setup from fresh clone
npm install                    # 45 seconds
npm run compile               # Variable time, network dependent
npm start                     # Start bot (requires Discord credentials)

# Development tools  
npm run lint                  # 9 seconds - check code quality
npm run fix                   # 11 seconds - auto-fix issues
npm run migrate-dev           # Create new migration
npm run prisma-generate       # Generate Prisma client
```

### Code Structure Patterns
- Commands defined in `src/register.ts` using Discord.js SlashCommandBuilder
- Event handlers in `src/app/handlers/` dispatch to feature modules
- Database operations use Prisma services in `src/db/`
- Discord embeds and UI components in respective feature directories
- Logging configured per component category in log4js config

### Deployment
- **Staging**: Automatic deploy to staging on `stg` branch merge via GitHub Actions
- **Production**: Automatic deploy to production on `main` branch merge via GitHub Actions
- **Deploy Process**: Git pull → npm install → npm run compile → systemctl restart service

## Known Limitations
- **Network Dependency**: Build process requires internet access for Prisma engine downloads
- **No Tests**: Project has no automated test suite
- **Discord Dependent**: Cannot run or test without valid Discord bot credentials
- **Canvas Dependencies**: Requires system build tools for native Canvas package compilation

## Quick Architecture Overview
This is a TypeScript Discord bot using discord.js v14 that provides:
- Splatoon 3 game recruitment system with scheduled event integration
- Team division and voice channel management tools
- Admin utilities for channel and role management
- Automated moderation and user onboarding features
- Integration with Splatoon 3 APIs for game schedule information