# Hedera Loky Integration

A comprehensive platform that integrates Hedera ecosystem tokens with Loky's advanced token analysis capabilities, powered by LLM technology and Hedera Consensus Service (HCS).

## Features

### Token Analysis with Loky Integration
- Integrated Hedera ecosystem tokens with detailed analysis capabilities
- Loky provides comprehensive token analysis for informed trading decisions
- LLM-powered insights combined with Loky API for detailed token information
- Natural language interface to query token information using simple commands

### HCS-10 Implementation
- Create and manage topics on Hedera Consensus Service
- Send and receive messages using the HCS-10 protocol
- Implement request-response patterns for asynchronous communication
- Handle message subscriptions and callbacks
- Example implementations for common use cases

## How Hedera SDKs Enhance the Platform

### Loky Integration for Token Analysis
- Seamless integration with Hedera ecosystem tokens for comprehensive analysis
- Loky provides detailed token analysis including price trends, market cap, and trading volumes
- Advanced analytics help users make informed trading decisions
- Natural language interface allows for intuitive querying of token information

### Hedera Consensus Service (HCS) Integration
- With HCS integration, Loky is now open to communicate with any agent on the Hedera network
- Agents can request and receive token analysis in real-time through standardized messaging
- The HCS-10 protocol enables structured communication between Loky and other services
- Secure, timestamped, and immutable record of all token analysis requests and responses

### Agent Capabilities with HCS
- Agents get complete insights about tokens and can use this information to their advantage
- Trading bots can make informed decisions based on Loky's detailed token analysis
- Monitoring agents can track token performance and alert users of significant changes
- Portfolio management agents can optimize holdings based on token analysis

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- TypeScript (v4.5 or higher)
- PostgreSQL database
- Hedera account with HBAR
- OpenAI API key (for LLM functionality)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/hedera-loky-integration.git
cd hedera-loky-integration
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Edit the `.env` file with your credentials:
```
# Hedera credentials
HEDERA_ACCOUNT_ID=0.0.YOUR_ACCOUNT_ID
HEDERA_PRIVATE_KEY=YOUR_PRIVATE_KEY
HEDERA_NETWORK=testnet

# OpenAI API key for LLM access
OPENAI_API_KEY=YOUR_OPENAI_API_KEY

# PostgreSQL database configuration
DB_NAME=hedera_tokens
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
```

5. Build the project:
```bash
npm run build
```

## How to Run the Project

### Setup Environment
Before running any component, make sure your environment is properly configured:

```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your credentials
# Then build the project
npm run build
```

### Token Fetcher
Fetches and stores Hedera ecosystem tokens from CoinGecko:

```bash
npm run token-fetcher
```

This will retrieve token information from CoinGecko and store it in your PostgreSQL database.

## Project Structure

### Token Fetcher
- `src/config/database.ts` - Database connection configuration
- `src/models/token.ts` - Token model schema
- `src/services/coingeckoService.ts` - Service to fetch data from CoinGecko
- `src/controllers/tokenController.ts` - Controller to handle token operations
- `src/utils/logger.ts` - Simple logging utility
- `src/index.ts` - Main application entry point

### HCS-10 Implementation
- `src/hcs10/types.ts` - Type definitions for HCS-10 messages
- `src/hcs10/topicManager.ts` - Topic creation and management
- `src/hcs10/messageService.ts` - Message handling and subscriptions
- `src/hcs10/hcs10Client.ts` - Main client for HCS-10 protocol
- `src/hcs10/examples/` - Example implementations

## License

MIT
