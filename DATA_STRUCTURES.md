# Data Structures in the AI Expense Advisor

This document outlines the primary data structures used in the AI Expense Advisor application, covering both the database schema and the frontend data handling.

## 1. Database Schema

The core data structures are defined by the database schema, which consists of three main tables: `Budgets`, `Incomes`, and `Expenses`. These tables are managed using Drizzle ORM.

### `Budgets` Table

This table stores information about the budgets created by users.

| Column      | Type      | Description                               |
| :---------- | :-------- | :---------------------------------------- |
| `id`        | `serial`  | **Primary Key** - Unique identifier for the budget. |
| `name`      | `varchar` | The name of the budget (e.g., "Groceries", "Rent"). |
| `amount`    | `varchar` | The total amount allocated for the budget. |
| `icon`      | `varchar` | An icon to visually represent the budget. |
| `createdBy` | `varchar` | The email address of the user who created the budget. |

### `Incomes` Table

This table stores information about the user's sources of income.

| Column      | Type      | Description                               |
| :---------- | :-------- | :---------------------------------------- |
| `id`        | `serial`  | **Primary Key** - Unique identifier for the income source. |
| `name`      | `varchar` | The name of the income source (e.g., "Salary", "Freelance"). |
| `amount`    | `varchar` | The amount of income from the source.     |
| `icon`      | `varchar` | An icon to visually represent the income source. |
| `createdBy` | `varchar` | The email address of the user who created the income source. |

### `Expenses` Table

This table stores individual expense records.

| Column      | Type      | Description                               |
| :---------- | :-------- | :---------------------------------------- |
| `id`        | `serial`  | **Primary Key** - Unique identifier for the expense. |
| `name`      | `varchar` | The name of the expense (e.g., "Milk", "Electricity Bill"). |
| `amount`    | `numeric` | The amount of the expense.                |
| `budgetId`  | `integer` | **Foreign Key** - References the `id` of the associated budget in the `Budgets` table. |
| `createdAt` | `varchar` | The date the expense was created.         |

## 2. Frontend Data Structures

On the frontend, the data is primarily handled as arrays of objects, where each object corresponds to a record from the database. These are managed in the `Dashboard` component using React's `useState` hook.

*   `budgetList`: An array of budget objects. Each object in this array has the same structure as a row in the `Budgets` table, with the addition of two calculated fields:
    *   `totalSpend`: The sum of all expenses associated with the budget.
    *   `totalItem`: The total count of expenses for that budget.

*   `incomeList`: An array of income objects, where each object has the same structure as a row in the `Incomes` table.

*   `expensesList`: An array of expense objects, where each object has the same structure as a row in the `Expenses` table.

### Data Fetching and Transformation

The `getBudgetList` function in the `Dashboard` component is responsible for fetching and transforming the data. It performs the following operations:

1.  **Fetches Budgets with Aggregated Data:** It retrieves the list of budgets and, for each budget, calculates the total spend and the number of items by joining with the `Expenses` table and using SQL aggregation functions (`sum` and `count`).

2.  **Fetches All Expenses:** It retrieves a list of all expenses for the user.

3.  **Fetches All Incomes:** It retrieves a list of all incomes for the user.

The fetched data is then stored in the respective state variables (`budgetList`, `expensesList`, `incomeList`) and passed down to child components for rendering.

## 3. Algorithms and Optimization Techniques

The application employs several algorithms and optimization techniques to ensure efficient data handling and a smooth user experience.

### Data Fetching and Processing

*   **Parallel Data Fetching:** The application uses `Promise.all` to fetch budgets, expenses, and incomes concurrently. This parallel execution of database queries significantly reduces the overall data loading time compared to fetching the data sequentially.

*   **Database-Level Aggregation:** The application offloads complex calculations to the database. Instead of fetching all expenses for a budget and then calculating the sum and count on the client-side, it uses SQL's `sum()` and `count()` functions within the database query. This is highly efficient as databases are optimized for such operations.

*   **Sorting:** The data is sorted at the database level using `orderBy`, ensuring that the data is presented in a consistent and predictable order (e.g., most recent items first).

### Frontend Performance Optimization

*   **Memoization:** The application uses React's `useMemo` and `useCallback` hooks to prevent unnecessary re-renders and expensive recalculations.
    *   `useCallback` is used to memoize functions, ensuring that they are not recreated on every render. This is important for child components that receive these functions as props.
    *   `useMemo` is used to memoize the results of expensive calculations. For example, the list of budget items is memoized so that it is only re-rendered when the underlying budget data changes.

*   **Lazy Loading:** The application uses `React.lazy` to code-split the application. This means that the code for certain components is only loaded when they are needed, which reduces the initial bundle size and improves the initial page load time.

*   **Conditional Rendering and Skeletons:** While data is being fetched, the application displays loading skeletons. This provides a better user experience than showing a blank screen and gives the user a visual indication that content is being loaded.
