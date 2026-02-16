# TrustTrade - Community Trading Platform

A modern, trust-based trading platform built with React, TypeScript, and Tailwind CSS. Trade goods, services, and skills with your community in a safe, verified environment.

## 🌟 Features

### Core Functionality
- **Split Hero Landing Page** - Clear distinction between offering and requesting items/services
- **Marketplace** - Browse listings with grid/map toggle views
- **Advanced Search & Filtering** - Find exactly what you need
- **Real-time Activity Feed** - See live trading activity
- **Trust Score System** - Build reputation through successful trades
- **Value Points (VP)** - Fair trade valuation system
- **Cash Sweeteners** - Option to add cash to balance trades

### Authentication & Security
- Email/Password authentication
- Social login support (Google, GitHub)
- Multi-tier verification system:
  - Email verification
  - Phone verification
  - Identity verification
  - Business verification
- Protected routes for authenticated users

### User Features
- **Personal Dashboard** - Track trades, stats, and activity
- **User Profiles** - Showcase reputation and trading history
- **Reviews & Ratings** - Build trust through feedback
- **Achievement System** - Unlock badges and levels
- **Messages** - In-platform communication

### Trading Features
- **Create Listings** - Offer goods/services or request what you need
- **Trade Management** - Track pending, active, and completed trades
- **Trade Timeline** - Visual progress tracking
- **Safety Guidelines** - Built-in safety tips and warnings

### Community Features
- **Community Forum** - Discuss, share, and connect
- **Local Events** - Meet fellow traders at community events
- **Success Stories** - Share and inspire

### Admin Features
- **Admin Dashboard** - Platform oversight and analytics
- **User Management** - Moderate users and content
- **Report Handling** - Review and resolve issues
- **Verification Queue** - Process verification requests

## 🎨 Design Features

### Dark Mode First
- Beautiful dark theme by default
- Light mode support with toggle
- Smooth theme transitions

### Modern UI Components
- Shadcn/ui component library
- Radix UI primitives
- Lucide React icons
- Motion animations
- Responsive design for all screen sizes

### Visual Effects
- Gradient accents (purple/blue theme)
- Hover animations
- Loading states
- Toast notifications
- Grid background patterns

## 🛠️ Tech Stack

- **React 18.3** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router 7** - Navigation
- **Tailwind CSS v4** - Styling
- **Motion** - Animations
- **Radix UI** - Accessible components
- **Recharts** - Data visualization
- **Sonner** - Toast notifications

## 📁 Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── ui/                 # Reusable UI components
│   │   ├── Listings/           # Listing components
│   │   ├── Modals/             # Modal dialogs
│   │   ├── Header.tsx          # Main navigation
│   │   └── Footer.tsx          # Site footer
│   └── pages/
│       ├── HomePage.tsx        # Landing + marketplace
│       ├── LoginPage.tsx       # Authentication
│       ├── SignupPage.tsx      # Registration
│       ├── DashboardPage.tsx   # User dashboard
│       ├── ProfilePage.tsx     # User profile
│       ├── TradesPage.tsx      # Trade management
│       ├── CommunityPage.tsx   # Forum
│       ├── EventsPage.tsx      # Events
│       ├── AdminPage.tsx       # Admin panel
│       └── ListingDetailPage.tsx # Listing details
├── contexts/
│   ├── AuthContext.tsx         # Authentication state
│   └── ThemeContext.tsx        # Theme management
├── config/
│   └── api.ts                  # API config & constants
└── styles/
    ├── theme.css               # Theme variables
    ├── tailwind.css            # Tailwind imports
    └── fonts.css               # Font imports
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or pnpm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. Start the development server:
   ```bash
   npm run build
   ```

4. Open your browser to the local development URL

## 🔑 Key Features Explained

### Trust Score System
- Starts at 50 for new users
- Increases with:
  - Email verification (+5)
  - Phone verification (+10)
  - Identity verification (+15)
  - Business verification (+20)
  - Completed trades (+2-5 each)
  - Positive reviews (+3)
- Decreases with:
  - Reports (-10)
  - Failed trades (-5)
  - Late deliveries (-2)

### Value Points (VP)
- Platform currency for fair trades
- 1 VP ≈ $1 USD (reference only)
- Range: 10 - 10,000 VP per listing
- No actual money exchanged (except optional cash sweeteners)

### Verification Tiers
1. **Basic** - Email verified
2. **Verified** - Email + Phone
3. **Trusted** - Email + Phone + Identity + 10+ trades
4. **Business** - All Trusted requirements + Business verification

## 🎯 Future Enhancements

Potential features to add:
- Real-time chat with WebSocket
- Map-based listing discovery
- Mobile app (React Native)
- Escrow service for high-value trades
- AI-powered listing recommendations
- Advanced analytics dashboard
- Multi-language support
- Blockchain-based trust ledger

## 📝 Mock Data

The application currently uses mock data for demonstration. In production, connect to:
- Authentication API (Firebase, Supabase, etc.)
- Database (PostgreSQL, MongoDB)
- File storage (S3, Cloudinary)
- Real-time messaging (Socket.io, Pusher)

## 🤝 Contributing

This is a demonstration project. For production use:
1. Replace mock authentication with real auth service
2. Connect to actual database
3. Implement real-time features
4. Add payment processing for cash sweeteners
5. Implement actual verification workflows
6. Add comprehensive error handling
7. Set up monitoring and analytics

## 📄 License

This project is for demonstration purposes.

## 🙏 Acknowledgments

- UI components from [Shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Images from [Unsplash](https://unsplash.com/)
