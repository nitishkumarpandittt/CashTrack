# System Design: CashTrack

## 1. Purpose and Core Functionality

### Purpose

CashTrack is a modern, AI-powered personal finance management application designed to empower users to take control of their financial health. Its primary purpose is to provide an intuitive, secure, and intelligent platform for tracking income, managing budgets, and monitoring expenses. By integrating AI-driven insights, the application goes beyond simple tracking to offer personalized, actionable advice, helping users make smarter financial decisions and achieve their financial goals.

### Core Functionalities:

-   **Unified Financial Dashboard:** A central hub that provides a real-time overview of the user's financial status, including total income, expenses, and budget utilization.
-   **Budget Management:** Allows users to create, update, and delete personalized budget categories with set spending limits.
-   **Income Tracking:** Enables users to log and manage multiple sources of income.
-   **Expense Tracking:** Provides a simple interface for users to add and categorize their daily expenses, linking them to specific budgets.
-   **AI-Powered Financial Advisor:** A key feature that analyzes a user's spending patterns and provides personalized recommendations for saving money, optimizing budgets, and improving their overall financial health score.
-   **Secure User Authentication:** A complete and secure authentication system (powered by Clerk) to manage user accounts and protect sensitive financial data.

---

## 2. Functional and Non-Functional Requirements

### Functional Requirements

These define the specific behaviors and functions of the system.

#### User & Authentication
1.  **User Registration:** Users must be able to create a new account using an email and password or social providers.
2.  **User Login/Logout:** Registered users must be able to sign in to their account and securely sign out.
3.  **Route Protection:** All user-specific data and dashboard pages must be protected and accessible only to authenticated users.

#### Budget Management
1.  **Create Budget:** Users must be able to create a new budget category with a name, a monthly spending limit, and an associated icon.
2.  **View Budgets:** Users must be able to see a list of all their created budgets, along with their spending progress for the current month.
3.  **Edit/Delete Budget:** Users must be able to modify the details of an existing budget or delete it entirely.

#### Income Management
1.  **Add Income:** Users must be able to add an income source with a name and amount.
2.  **View Incomes:** Users must be able to see a list of all their income sources.
3.  **Delete Income:** Users must be able to remove an income source.

#### Expense Management
1.  **Add Expense:** Users must be able to add a new expense with a name, amount, and link it to a specific budget category.
2.  **View Expenses:** Users must be able to view a detailed list or table of their recent expenses, including the name, amount, date, and category.
3.  **Delete Expense:** Users must be able to delete an expense entry.

#### AI & Analytics
1.  **Dashboard Analytics:** The main dashboard must display key financial metrics, such as total income, total expenses, and the remaining budget.
2.  **Visual Reports:** The application must display visual charts (e.g., bar charts) to represent budget vs. spending.
3.  **AI Recommendations:** The system must be able to generate and display personalized financial advice based on the user's spending habits.

### Non-Functional Requirements

These define the quality attributes and constraints of the system.

#### Performance
1.  **Fast Page Loads:** The application must be highly performant, with critical pages like the dashboard loading in under 2 seconds.
2.  **Responsive UI:** All UI interactions, such as opening modals, submitting forms, and animations, must be smooth and immediate, without noticeable lag.
3.  **Efficient Data Fetching:** Database queries must be optimized to ensure that data is fetched and displayed quickly, even as the user's financial history grows.

#### Security
1.  **Secure Authentication:** User authentication must be handled by a trusted third-party service (Clerk) to ensure industry-standard security for user credentials and sessions.
2.  **Data Privacy:** All user financial data must be securely stored in the database and only accessible by the authenticated user who owns the data.
3.  **Secure API Communication:** All communication between the client and the server must be encrypted using HTTPS.

#### Usability
1.  **Intuitive Design:** The user interface must be clean, modern, and easy to navigate, allowing users to perform core tasks with minimal effort.
2.  **Mobile-First Responsiveness:** The application must be fully functional and visually appealing on a wide range of devices, including desktops, tablets, and smartphones.
3.  **Accessibility:** The application should follow web accessibility best practices (WCAG) to be usable by people with disabilities.

#### Reliability & Scalability
1.  **High Availability:** The application should be deployed on a reliable infrastructure to ensure high uptime and availability.
2.  **Database Scalability:** The chosen database solution (Neon Serverless PostgreSQL) must be able to scale automatically to handle a growing number of users and financial records without performance degradation.
