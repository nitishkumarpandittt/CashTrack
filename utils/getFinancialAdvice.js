// utils/getFinancialAdvice.js
import OpenAI from "openai";

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

// Function to generate personalized financial advice
const getFinancialAdvice = async (totalBudget, totalIncome, totalSpend) => {
  console.log("Inputs:", { totalBudget, totalIncome, totalSpend });

  if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
    console.error("API key is missing.");
    return "API key is missing. Please configure it in your environment.";
  }

  try {
    const userPrompt = `
      Based on the following financial data:
      - Total Budget: ${totalBudget} Rupees
      - Expenses: ${totalSpend} Rupees
      - Incomes: ${totalIncome} Rupees
      Provide detailed financial advice in 2 sentences to help the user manage their finances more effectively.
    `;

    // Send the prompt to the OpenAI API
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: userPrompt }],
    });

    // Process and return the response
    const advice = chatCompletion.choices[0].message.content.trim();
    console.log("Generated Advice:", advice);

    return advice;
  } catch (error) {
    console.error("Error fetching financial advice:", error.response?.data || error.message);

    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        return "Invalid API key. Please verify your configuration.";
      } else if (status === 429) {
        return "Rate limit exceeded. Please try again later.";
      } else if (status === 500) {
        return "Server error at OpenAI. Please try again later.";
      }
    }

    return "Sorry, I couldn't fetch the financial advice at this moment. Please try again later.";
  }
};

export default getFinancialAdvice;
