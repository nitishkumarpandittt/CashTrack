# 💰 CashTrack - AI-Powered Personal Finance Manager

<div align="center">


   ![CashTrack Logo](./image.png "cashtrack")


  <div>
    <img src="https://img.shields.io/badge/-Next_JS-black?style=for-the-badge&logoColor=white&logo=nextdotjs&color=000000" alt="nextdotjs" />
    <img src="https://img.shields.io/badge/-React-black?style=for-the-badge&logoColor=white&logo=react&color=61DAFB" alt="react" />
    <img src="https://img.shields.io/badge/-Tailwind_CSS-black?style=for-the-badge&logoColor=white&logo=tailwindcss&color=06B6D4" alt="tailwindcss" />
    <img src="https://img.shields.io/badge/-Clerk-black?style=for-the-badge&logoColor=white&logo=clerk&color=6C47FF" alt="clerk" />
    <img src="https://img.shields.io/badge/-Drizzle-black?style=for-the-badge&logoColor=white&logo=drizzle&color=C5F74F" alt="drizzle" />
    <img src="https://img.shields.io/badge/-PostgreSQL-black?style=for-the-badge&logoColor=white&logo=postgresql&color=336791" alt="postgresql" />
  </div>

  <h3 align="center">Smart Financial Management with AI-Driven Insights</h3>

   <div align="center">
     Take control of your financial future with intelligent budgeting, expense tracking, and personalized AI recommendations.
    </div>
</div>

## 📋 Table of Contents

1. [🤖 Introduction](#introduction)
2. [⚙️ Tech Stack](#tech-stack)
3. [🔋 Features](#features)
4. [🚀 Quick Start](#quick-start)
5. [📱 Usage Guide](#usage-guide)
6. [🛠️ Development](#development)
7. [🔧 Configuration](#configuration)
8. [📊 Database Schema](#database-schema)
9. [🤝 Contributing](#contributing)
10. [📄 License](#license)

## 🤖 Introduction

**CashTrack** is a modern, AI-powered personal finance management application built with Next.js 14 and React 18. It combines intelligent financial analysis with an intuitive user interface to help users make informed financial decisions.

### Why CashTrack?

- **🤖 AI-Powered Insights**: Get personalized financial advice based on your spending patterns
- **📊 Smart Analytics**: Track savings rate, surplus, and budget utilization in real-time
- **🎯 Goal-Oriented**: Set and track financial goals with intelligent recommendations
- **📱 Mobile-First**: Fully responsive design optimized for all devices
- **🔒 Secure**: Bank-level security with Clerk authentication
- **⚡ Fast**: Optimized for performance with lazy loading and efficient caching

## ⚙️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **React 18** - UI library with latest features
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Lucide React** - Beautiful icons
- **Recharts** - Data visualization

### Backend & Database
- **Drizzle ORM** - Type-safe database toolkit
- **PostgreSQL** - Robust relational database
- **Neon Database** - Serverless PostgreSQL

### Authentication & Security
- **Clerk** - Complete authentication solution
- **Middleware** - Route protection and user management

### AI & Analytics
- **Local AI Intelligence** - Cost-effective financial analysis
- **Hugging Face API** - Optional advanced AI features
- **Smart Calculations** - Real-time financial metrics

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Drizzle Kit** - Database migrations

## 🔋 Features

### 💡 Core Features

✅ **Smart Budget Management**
- Create unlimited budget categories
- Real-time spending tracking
- Visual progress indicators
- Overspending alerts

✅ **Income Tracking**
- Multiple income sources
- Recurring income setup
- Income vs expense analysis
- Monthly/yearly summaries

✅ **Expense Management**
- Quick expense entry
- Category-based organization
- Receipt tracking
- Spending pattern analysis

✅ **AI Financial Advisor**
- Personalized financial insights
- Savings rate optimization
- Budget recommendations
- Financial health scoring

### 🎨 User Experience

✅ **Modern Interface**
- Clean, intuitive design
- Dark/light mode support
- Responsive across all devices
- Smooth animations

✅ **Performance Optimized**
- Fast page loads (< 2s)
- Lazy loading components
- Efficient data caching
- Optimized images

✅ **Mobile-First Design**
- Touch-friendly interface
- Swipe gestures
- Bottom navigation
- Offline capabilities

### 📊 Analytics & Insights

✅ **Financial Metrics**
- Savings rate calculation
- Budget utilization tracking
- Surplus/deficit analysis
- Spending trends

✅ **Visual Reports**
- Interactive charts
- Category breakdowns
- Monthly comparisons
- Goal progress tracking

✅ **AI Recommendations**
- Spending optimization tips
- Budget adjustment suggestions
- Investment recommendations
- Financial goal planning

## 🚀 Quick Start

### Prerequisites

Make sure you have the following installed:

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **npm** or **yarn** - Package manager
- **Git** - Version control

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/cashtrack.git
cd cashtrack
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_secret_here

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Database
NEXT_PUBLIC_DATABASE_URL=postgresql://username:password@host:port/database

# Optional: AI Features
NEXT_PUBLIC_HUGGINGFACE_API_KEY=your_huggingface_key_here

# Performance (Optional)
NEXT_TELEMETRY_DISABLED=1
GENERATE_SOURCEMAP=false
```

4. **Set up the database**
```bash
npm run db:push
```

5. **Start the development server**
```bash
npm run dev
```

6. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

### Quick Setup with Docker (Optional)

```bash
# Build and run with Docker
docker build -t cashtrack .
docker run -p 3000:3000 cashtrack
```

## 📱 Usage Guide

### Getting Started

1. **Sign Up/Sign In**
   - Create an account or sign in with existing credentials
   - Complete your profile setup

2. **Add Income Sources**
   - Navigate to Income section
   - Add your salary, freelance, or other income sources
   - Set up recurring income for automation

3. **Create Budgets**
   - Go to Budgets section
   - Create categories (Food, Transport, Entertainment, etc.)
   - Set monthly limits for each category

4. **Track Expenses**
   - Add expenses to appropriate budget categories
   - Use quick-add for frequent expenses
   - Upload receipts for record keeping

5. **Monitor Progress**
   - Check your dashboard for real-time insights
   - Review AI recommendations
   - Adjust budgets based on spending patterns

### Pro Tips

- **Set Realistic Budgets**: Start with your actual spending and gradually optimize
- **Regular Updates**: Update expenses weekly for accurate insights
- **Use Categories**: Proper categorization improves AI recommendations
- **Review Monthly**: Check monthly reports to identify trends

## 🛠️ Development

### Project Structure

```
cashtrack/
├── app/                          # Next.js App Router
│   ├── (routes)/                # Protected routes
│   │   └── dashboard/           # Dashboard pages
│   ├── _components/             # Shared components
│   ├── globals.css              # Global styles
│   └── layout.js               # Root layout
├── components/                   # Reusable UI components
│   └── ui/                     # shadcn/ui components
├── utils/                       # Utility functions
│   ├── schema.jsx              # Database schema
│   ├── dbConfig.jsx            # Database configuration
│   └── getFinancialAdvice.js   # AI logic
├── public/                      # Static assets
└── package.json                # Dependencies
```

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run dev:clean        # Clean build and start dev server
npm run dev:turbo        # Start with Turbo mode

# Production
npm run build            # Build for production
npm run start            # Start production server
npm run build:analyze    # Build with bundle analyzer

# Database
npm run db:push          # Push schema changes
npm run db:studio        # Open Drizzle Studio

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run type-check       # TypeScript type checking
```

### Performance Optimization

The application is optimized for speed:

- **Fast Refresh**: ~1.5s startup time
- **Code Splitting**: Lazy-loaded components
- **Image Optimization**: WebP format, responsive sizes
- **Caching**: Efficient data caching strategies
- **Bundle Size**: Optimized imports and tree shaking

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key | ✅ |
| `CLERK_SECRET_KEY` | Clerk secret key | ✅ |
| `NEXT_PUBLIC_DATABASE_URL` | PostgreSQL connection string | ✅ |
| `NEXT_PUBLIC_HUGGINGFACE_API_KEY` | Hugging Face API key | ❌ |

### Database Setup

1. **Create a Neon Database**
   - Sign up at [Neon](https://neon.tech/)
   - Create a new project
   - Copy the connection string

2. **Configure Drizzle**
   - Update `drizzle.config.js` with your database URL
   - Run migrations: `npm run db:push`

3. **Verify Setup**
   - Open Drizzle Studio: `npm run db:studio`
   - Check tables are created correctly

### Clerk Authentication Setup

1. **Create Clerk Application**
   - Sign up at [Clerk](https://clerk.com/)
   - Create a new application
   - Copy API keys

2. **Configure Authentication**
   - Add environment variables
   - Customize sign-in/sign-up pages
   - Set up redirect URLs

## 📊 Database Schema

### Tables

**Budgets**
```sql
- id: serial (Primary Key)
- name: varchar (Budget name)
- amount: varchar (Budget amount)
- icon: varchar (Category icon)
- createdBy: varchar (User ID)
```

**Incomes**
```sql
- id: serial (Primary Key)
- name: varchar (Income source name)
- amount: varchar (Income amount)
- icon: varchar (Source icon)
- createdBy: varchar (User ID)
```

**Expenses**
```sql
- id: serial (Primary Key)
- name: varchar (Expense description)
- amount: numeric (Expense amount)
- budgetId: integer (Foreign Key to Budgets)
- createdAt: varchar (Creation timestamp)
```

### Relationships

- **Budgets** → **Expenses** (One-to-Many)
- **Users** → **Budgets** (One-to-Many)
- **Users** → **Incomes** (One-to-Many)

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
5. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure mobile responsiveness
- Test across different browsers

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>Built with ❤️ by the CashTrack </p>
  <p>
    <a href="#top">Back to Top</a> •
    <a href="https://github.com/yourusername/cashtrack/issues">Report Bug</a> •
    <a href="https://github.com/yourusername/cashtrack/issues">Request Feature</a>
  </p>
</div>
