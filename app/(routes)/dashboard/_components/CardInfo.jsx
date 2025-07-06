import formatNumber from "@/utils";
import getFinancialAdvice from "@/utils/getFinancialAdvice";
import getAdvancedFinancialAdvice from "@/utils/getAdvancedFinancialAdvice";
import {
  PiggyBank,
  ReceiptText,
  Wallet,
  Sparkles,
  CircleDollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import LoadingSpinner from "@/app/_components/LoadingSpinner";

function CardInfo({ budgetList, incomeList, expensesList = [] }) {
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalSpend, setTotalSpend] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [financialAdvice, setFinancialAdvice] = useState("");
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);
  const [savingsRate, setSavingsRate] = useState(0);
  const [financialHealth, setFinancialHealth] = useState("neutral");

  useEffect(() => {
    if (budgetList.length > 0 || incomeList.length > 0) {
      CalculateCardInfo();
    }
  }, [budgetList, incomeList]);

  useEffect(() => {
    if (totalBudget > 0 || totalIncome > 0 || totalSpend > 0) {
      const fetchFinancialAdvice = async () => {
        setIsLoadingAdvice(true);
        try {
          // Use enhanced AI service with more context
          const advice = await getAdvancedFinancialAdvice(
            totalBudget,
            totalIncome,
            totalSpend,
            budgetList,
            expensesList
          );
          setFinancialAdvice(advice);

          // Calculate additional metrics with proper validation
          const savings = Number(totalIncome) - Number(totalSpend);
          const rate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

          // Ensure rate is a valid number
          const validRate = isNaN(rate) ? 0 : rate;
          setSavingsRate(validRate);

          // Determine financial health
          if (rate >= 20) setFinancialHealth("excellent");
          else if (rate >= 10) setFinancialHealth("good");
          else if (rate >= 0) setFinancialHealth("fair");
          else setFinancialHealth("poor");

        } catch (error) {
          console.error("Error fetching advice:", error);
          setFinancialAdvice("Unable to generate financial insights at the moment.");
        } finally {
          setIsLoadingAdvice(false);
        }
      };

      fetchFinancialAdvice();
    }
  }, [totalBudget, totalIncome, totalSpend, budgetList, expensesList]);

  const CalculateCardInfo = () => {
    console.log(budgetList);
    let totalBudget_ = 0;
    let totalSpend_ = 0;
    let totalIncome_ = 0;

    // Calculate budget and spending totals with proper number conversion
    budgetList.forEach((element) => {
      const amount = Number(element.amount) || 0;
      const spend = Number(element.totalSpend) || 0;
      totalBudget_ = totalBudget_ + amount;
      totalSpend_ = totalSpend_ + spend;
    });

    // Calculate income total with proper number conversion
    incomeList.forEach((element) => {
      const amount = Number(element.totalAmount) || 0;
      totalIncome_ = totalIncome_ + amount;
    });

    // Ensure all values are valid numbers
    setTotalIncome(isNaN(totalIncome_) ? 0 : totalIncome_);
    setTotalBudget(isNaN(totalBudget_) ? 0 : totalBudget_);
    setTotalSpend(isNaN(totalSpend_) ? 0 : totalSpend_);
  };

  // Get financial health icon and color
  const getFinancialHealthIcon = () => {
    switch (financialHealth) {
      case "excellent": return <CheckCircle className="w-6 h-6 text-green-500" />;
      case "good": return <TrendingUp className="w-6 h-6 text-blue-500" />;
      case "fair": return <AlertCircle className="w-6 h-6 text-yellow-500" />;
      case "poor": return <TrendingDown className="w-6 h-6 text-red-500" />;
      default: return <Sparkles className="w-6 h-6 text-purple-500" />;
    }
  };

  const getHealthColor = () => {
    switch (financialHealth) {
      case "excellent": return "from-green-50 to-emerald-50 border-green-200";
      case "good": return "from-blue-50 to-cyan-50 border-blue-200";
      case "fair": return "from-yellow-50 to-amber-50 border-yellow-200";
      case "poor": return "from-red-50 to-rose-50 border-red-200";
      default: return "from-blue-50 to-purple-50 border-gray-200";
    }
  };

  return (
    <div>
      {budgetList?.length > 0 ? (
        <div>
          {/* Enhanced AI Financial Advisor Section */}
          <div className={`p-4 md:p-6 border-2 mt-4 -mb-1 rounded-2xl bg-gradient-to-r ${getHealthColor()} shadow-lg`}>
            <div className="flex-1">
              <div className="flex mb-4 flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-3 items-start md:items-center justify-between">
                <div className="flex items-center space-x-2 md:space-x-3">
                  <h2 className="text-lg md:text-xl font-bold text-gray-800">CashTrack AI</h2>
                  <Sparkles
                    className="rounded-full text-white w-6 h-6 md:w-8 md:h-8 p-1 md:p-2
                      bg-gradient-to-r
                      from-pink-500
                      via-red-500
                      to-yellow-500
                      background-animate
                      gpu-accelerated"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  {getFinancialHealthIcon()}
                  <span className="text-xs md:text-sm font-medium text-gray-600 capitalize">{financialHealth}</span>
                </div>
              </div>

              {/* Financial Metrics Row */}
              <div className="grid grid-cols-3 md:grid-cols-3 gap-2 md:gap-4 mb-4">
                <div className="bg-white/70 rounded-lg p-2 md:p-3">
                  <p className="text-xs text-gray-500 font-medium">Savings Rate</p>
                  <p className="text-sm md:text-lg font-bold text-gray-800">
                    {isNaN(savingsRate) ? "0.0" : savingsRate.toFixed(1)}%
                  </p>
                </div>
                <div className="bg-white/70 rounded-lg p-2 md:p-3">
                  <p className="text-xs text-gray-500 font-medium">Surplus</p>
                  <p className="text-sm md:text-lg font-bold text-gray-800">
                    Rs.{formatNumber(Number(totalIncome) - Number(totalSpend))}
                  </p>
                </div>
                <div className="bg-white/70 rounded-lg p-2 md:p-3">
                  <p className="text-xs text-gray-500 font-medium">Budget Use</p>
                  <p className="text-sm md:text-lg font-bold text-gray-800">
                    {totalBudget > 0 ? ((Number(totalSpend) / Number(totalBudget)) * 100).toFixed(1) : "0.0"}%
                  </p>
                </div>
              </div>

              <div className="bg-white/50 rounded-lg p-3 md:p-4">
                <p className="font-medium text-xs md:text-sm text-gray-700 leading-relaxed">
                  {isLoadingAdvice ? (
                    <span className="flex items-center space-x-3">
                      <LoadingSpinner size="sm" text="" showLogo={false} />
                      <span>Analyzing your financial data with AI...</span>
                    </span>
                  ) : (
                    financialAdvice || "Add your income and expenses to get personalized financial insights."
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 md:mt-7 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="p-4 md:p-6 border rounded-2xl flex items-center justify-between bg-white shadow-sm smooth-hover hover:shadow-md">
              <div>
                <h3 className="text-xs md:text-sm text-gray-500 font-medium">Total Budget</h3>
                <p className="font-bold text-lg md:text-2xl text-gray-800 mt-1">
                  Rs.{formatNumber(totalBudget)}
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-2 md:p-3 h-10 w-10 md:h-12 md:w-12 rounded-xl text-white shadow-lg">
                <PiggyBank size={20} className="md:w-6 md:h-6" />
              </div>
            </div>

            <div className="p-4 md:p-6 border rounded-2xl flex items-center justify-between bg-white shadow-sm smooth-hover hover:shadow-md">
              <div>
                <h3 className="text-xs md:text-sm text-gray-500 font-medium">Total Spend</h3>
                <p className="font-bold text-lg md:text-2xl text-gray-800 mt-1">
                  Rs.{formatNumber(totalSpend)}
                </p>
              </div>
              <div className="bg-gradient-to-br from-red-500 to-red-700 p-2 md:p-3 h-10 w-10 md:h-12 md:w-12 rounded-xl text-white shadow-lg">
                <ReceiptText size={20} className="md:w-6 md:h-6" />
              </div>
            </div>

            <div className="p-4 md:p-6 border rounded-2xl flex items-center justify-between bg-white shadow-sm smooth-hover hover:shadow-md">
              <div>
                <h3 className="text-xs md:text-sm text-gray-500 font-medium">No. Of Budget</h3>
                <p className="font-bold text-lg md:text-2xl text-gray-800 mt-1">
                  {budgetList?.length}
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-700 p-2 md:p-3 h-10 w-10 md:h-12 md:w-12 rounded-xl text-white shadow-lg">
                <Wallet size={20} className="md:w-6 md:h-6" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-7 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((item, index) => (
            <div
              className="h-[110px] w-full bg-slate-200 animate-pulse rounded-lg"
              key={index}
            ></div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CardInfo;
