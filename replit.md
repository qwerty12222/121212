# Project Architecture Guide

## Overview
GiftsBoss is a Telegram Mini App built with Next.js 14 that allows users to open gift cases and win virtual items. The application integrates with Telegram's Web App API, TON blockchain for payments, and Telegram Stars for purchases.

## User Preferences
- Communication style: Simple, everyday language
- Focus on fixing critical functionality: image loading, payment systems, and user experience
- Prioritize working features over placeholder/mock data

## System Architecture
Next.js 14 App Router with TypeScript, using:
- Server-side API routes for backend functionality
- Client-side React components with Telegram Web App integration
- TON Connect for blockchain wallet integration
- Telegram Bot API for payments and user management

## Key Components
- **Frontend**: React components with Radix UI and Tailwind CSS
- **Game Logic**: Case opening mechanics with probability-based rewards
- **Payment Systems**: 
  - TON blockchain integration for TON deposits
  - Telegram Stars payment API for in-app purchases
- **Image Handling**: Proxy service for handling .tgs files and external images
- **User Management**: In-memory user data with persistent session handling
- **API Integration**: External GiftsBattle API for case and item data

## Data Flow
1. User authentication via Telegram Web App
2. Case data fetched from external API (server.giftsbattle.com)
3. Images processed through proxy service for .tgs compatibility
4. Payment processing via TON Connect or Telegram Stars
5. User balance and inventory managed through API endpoints

## External Dependencies
- **server.giftsbattle.com**: Source for case and item data
- **TON Connect**: Blockchain wallet integration
- **Telegram Bot API**: Payment processing and user management
- **Image services**: Fallback image providers (Unsplash, Picsum)

## Recent Changes (July 13, 2025)
✓ Fixed Next.js server configuration to run on port 5000
✓ Implemented proper image proxy service for .tgs file handling
✓ Added real Telegram Stars payment API integration
✓ Enhanced TON deposit error handling
✓ Improved user balance management system
✓ Fixed viewport configuration warnings
✓ Added comprehensive fallback image system

## Deployment Strategy
- Runs on Replit with Node.js 20
- Uses Next.js development server on port 5000
- Requires environment variables: TELEGRAM_BOT_TOKEN, NEXT_PUBLIC_WEBAPP_URL