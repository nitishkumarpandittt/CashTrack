// utils/getAdvancedFinancialAdvice.js
// Enhanced AI-powered financial advice using Google Gemini API

import { GoogleGenerativeAI } from "@google/generative-ai";

const getAdvancedFinancialAdvice = async (totalBudget, totalIncome, totalSpend, budgetList = [], expensesList = []) => {
  console.log("Advanced AI Analysis Inputs:", { totalBudget, totalIncome, totalSpend, budgetList, expensesList });

  try {
    // Calculate comprehensive financial metrics
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalSpend) / totalIncome) * 100 : 0;
    const budgetUtilization = totalBudget > 0 ? (totalSpend / totalBudget) * 100 : 0;
    const surplus = totalIncome - totalSpend;
    const monthlyBurnRate = totalSpend;
    const emergencyFundMonths = surplus > 0 ? (surplus / monthlyBurnRate) * 12 : 0;

    // Analyze spending patterns
    const spendingAnalysis = analyzeSpendingPatterns(budgetList, expensesList);
    
    // Generate contextual advice using Google Gemini API (fallback to local intelligence)
    let advice = "";
    
    try {
      // Try Google Gemini API first (if API key is available)
      if (process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
        advice = await getGeminiAdvice(totalBudget, totalIncome, totalSpend, spendingAnalysis);
      } else {
        // Use local AI-like intelligence
        advice = generateLocalAdvice(savingsRate, budgetUtilization, surplus, spendingAnalysis);
      }
    } catch (error) {
      console.log("API unavailable, using local intelligence");
      advice = generateLocalAdvice(savingsRate, budgetUtilization, surplus, spendingAnalysis);
    }

    return advice;

  } catch (error) {
    console.error("Error in advanced financial analysis:", error);
    return "Unable to generate detailed analysis at the moment. Please ensure your financial data is complete and try again.";
  }
};

// Analyze spending patterns from budget and expense data
const analyzeSpendingPatterns = (budgetList, expensesList) => {
  const analysis = {
    topSpendingCategories: [],
    budgetOverruns: [],
    underutilizedBudgets: [],
    recentTrends: "stable"
  };

  if (budgetList && budgetList.length > 0) {
    // Find top spending categories
    const sortedBySpending = budgetList
      .filter(budget => budget.totalSpend > 0)
      .sort((a, b) => b.totalSpend - a.totalSpend)
      .slice(0, 3);
    
    analysis.topSpendingCategories = sortedBySpending.map(budget => ({
      name: budget.name,
      spent: budget.totalSpend,
      budget: budget.amount,
      utilization: (budget.totalSpend / budget.amount) * 100
    }));

    // Find budget overruns
    analysis.budgetOverruns = budgetList
      .filter(budget => budget.totalSpend > budget.amount)
      .map(budget => ({
        name: budget.name,
        overrun: budget.totalSpend - budget.amount,
        percentage: ((budget.totalSpend - budget.amount) / budget.amount) * 100
      }));

    // Find underutilized budgets
    analysis.underutilizedBudgets = budgetList
      .filter(budget => budget.totalSpend < budget.amount * 0.5 && budget.amount > 0)
      .map(budget => ({
        name: budget.name,
        unused: budget.amount - budget.totalSpend,
        utilization: (budget.totalSpend / budget.amount) * 100
      }));
  }

  return analysis;
};

// Generate advice using local intelligence
const generateLocalAdvice = (savingsRate, budgetUtilization, surplus, spendingAnalysis) => {
  let advice = "";

  // Primary financial health assessment
  if (savingsRate >= 30) {
    advice = "🌟 Outstanding financial management! You're saving over 30% of income. ";
  } else if (savingsRate >= 20) {
    advice = "💪 Excellent savings discipline! You're on track for strong financial security. ";
  } else if (savingsRate >= 10) {
    advice = "👍 Good financial habits! You're building a solid foundation. ";
  } else if (savingsRate >= 0) {
    advice = "⚠️ Your savings rate needs improvement. ";
  } else {
    advice = "🚨 Critical: You're spending more than you earn. ";
  }

  // Add specific recommendations based on spending analysis
  if (spendingAnalysis.budgetOverruns.length > 0) {
    const topOverrun = spendingAnalysis.budgetOverruns[0];
    advice += `Your ${topOverrun.name} category is ${topOverrun.percentage.toFixed(1)}% over budget. `;
  }

  if (spendingAnalysis.underutilizedBudgets.length > 0) {
    const totalUnused = spendingAnalysis.underutilizedBudgets.reduce((sum, budget) => sum + budget.unused, 0);
    advice += `You have Rs.${totalUnused.toLocaleString()} unused in budgets that could be reallocated. `;
  }

  if (spendingAnalysis.topSpendingCategories.length > 0) {
    const topCategory = spendingAnalysis.topSpendingCategories[0];
    advice += `${topCategory.name} is your highest expense at Rs.${topCategory.spent.toLocaleString()}. `;
  }

  // Add actionable recommendations
  if (surplus > 0) {
    advice += `Consider investing your Rs.${surplus.toLocaleString()} surplus in SIP, emergency fund, or debt repayment.`;
  } else if (surplus < 0) {
    advice += `Reduce expenses by Rs.${Math.abs(surplus).toLocaleString()} to achieve financial balance.`;
  }

  return advice;
};

// Google Gemini API integration
const getGeminiAdvice = async (totalBudget, totalIncome, totalSpend, spendingAnalysis) => {
  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `As a financial advisor, analyze this data:
Income: Rs.${totalIncome}, Budget: Rs.${totalBudget}, Spent: Rs.${totalSpend}
Top spending: ${spendingAnalysis.topSpendingCategories.map(cat => cat.name).join(', ')}
Provide 2-3 sentences of actionable financial advice.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error("Error with Gemini API:", error);
    throw new Error("Gemini API request failed");
  }
};

export default getAdvancedFinancialAdvice;
