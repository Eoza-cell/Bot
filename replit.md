# Friction Ultimate - WhatsApp RPG Bot

## Overview

Friction Ultimate is a comprehensive WhatsApp-based fantasy RPG bot featuring AI-powered narration, 3D character customization, and persistent cross-group gameplay. Players create unique characters, explore an immersive medieval world, and experience dynamic storytelling powered by Google Gemini AI.

## User Preferences

- Preferred communication style: Simple, everyday language
- Language: French (primary interface language)
- Game content: Medieval fantasy with mature themes
- Image requirements: HD fantasy images from stock sources (no AI generation)
- Character models: 3D realistic models for male/female characters with equipment customization

## Recent Changes (January 2025)

✓ Complete WhatsApp bot infrastructure with QR code authentication
✓ Database integration with PostgreSQL and Drizzle ORM
✓ Character creation system with 12 kingdoms and 7 orders
✓ AI-powered narrative system using Google Gemini
✓ HD stock image integration for immersive gameplay
✓ Advanced RPG mechanics (G-A power levels, health/energy systems)
✓ Cross-group character persistence via phone number identification
✓ Game Master system for dynamic scenario generation
✓ Combat system with precise action requirements

## System Architecture

### Backend Architecture
- **Node.js/Express Server**: Core application server handling bot operations and web interface
- **WhatsApp Web.js Integration**: Manages WhatsApp client connection and message handling
- **Modular Game Systems**: Separate modules for RPG mechanics, character management, and combat
- **Dual Storage Strategy**: Database-first approach with in-memory fallback for reliability

### Frontend Architecture
- **Static Web Interface**: HTML pages served via Express for bot management and QR code display
- **Bootstrap 5 Styling**: Modern, responsive UI with gradient backgrounds and glass-morphism effects
- **Real-time Status Updates**: WebSocket connections for live bot status monitoring

### AI Integration
- **Google Gemini AI**: Powers dynamic narrative generation and combat responses
- **Context-aware Storytelling**: AI maintains game lore consistency and immersive roleplay

## Key Components

### WhatsApp Bot System (`server/bot.js`)
- WhatsApp Web.js client with LocalAuth for persistent sessions
- QR code generation and real-time status monitoring
- Command routing system for game interactions
- Multi-group support with player recognition via phone numbers
- French language interface with comprehensive help system

### Advanced RPG Game Engine
- **RPGSystem** (`server/rpg-system.js`): Core mechanics with G-A power ranking, health/energy bars, experience system
- **CharacterSystem** (`server/character-system.js`): 12 kingdoms, 7 mystical orders, equipment management
- **GameMaster** (`server/game-master.js`): AI-driven scenario generation, quest hooks, dynamic storytelling
- **Combat System**: Precision-based combat requiring detailed action descriptions
- **ImageManager** (`server/image-manager.js`): HD stock images for locations, characters, and combat scenes

### Storage Layer
- **Dual Storage Approach**: Database operations with in-memory fallback
- **Drizzle ORM**: Type-safe database operations with PostgreSQL
- **Player Persistence**: Character data, inventory, combat logs, and session state

### Image Management
- **Stock Image Integration**: Curated Unsplash images for different game contexts
- **Contextual Media**: Location-specific, character-specific, and combat imagery
- **Caching System**: Performance optimization for frequently accessed images

## Data Flow

1. **Message Reception**: WhatsApp receives user message
2. **Command Parsing**: Bot identifies game commands and context
3. **Game Logic Processing**: Appropriate system handles the action
4. **AI Integration**: Gemini generates contextual narrative responses
5. **Database Updates**: Player state and actions are persisted
6. **Response Generation**: Formatted message with optional media sent back
7. **Session Continuity**: Game state maintained across conversations

## External Dependencies

### Core Services
- **WhatsApp Web.js**: WhatsApp client automation with persistent authentication
- **Google Gemini AI**: Advanced narrative generation, combat responses, and dynamic storytelling
- **Neon Database**: Serverless PostgreSQL with automatic failover to in-memory storage
- **Unsplash Stock Images**: HD fantasy imagery for immersive visual experience

### Deployment Infrastructure
- **Vercel Platform**: Serverless deployment with Node.js runtime
- **WebSocket Support**: Real-time communication capabilities
- **Environment Variables**: Secure API key and database URL management

### NPM Packages
- **Express 5**: Web server framework
- **Drizzle ORM**: Database operations
- **QRCode**: WhatsApp authentication QR generation
- **Axios**: HTTP client for external API calls
- **WebSocket (ws)**: Real-time communication

## Deployment Strategy

### Vercel Configuration
- **Serverless Functions**: Main application runs as Vercel function
- **API Route Handling**: All requests routed through `server/index.js`
- **Static Asset Serving**: Public directory served for web interface
- **Environment Configuration**: Production environment variables

### Database Strategy
- **Primary**: Neon PostgreSQL with Drizzle ORM
- **Fallback**: In-memory storage for development/testing
- **Schema Management**: Shared schema definitions for type safety

### Scalability Considerations
- **Stateless Design**: Bot instances can be recreated without data loss
- **Database Persistence**: All critical game state stored externally
- **Modular Architecture**: Easy to scale individual game systems

### Production Optimizations
- **30-second Function Timeout**: Configured for complex AI operations and image processing
- **WebSocket Constructor**: Custom configuration for Neon database compatibility
- **Dual Storage Strategy**: Database-first with in-memory fallback for reliability
- **Image Caching**: Performance optimization for frequently accessed fantasy images
- **Cross-Group Persistence**: Characters follow players across all WhatsApp groups