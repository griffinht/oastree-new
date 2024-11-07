import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function App() {
  const [annual, setAnnual] = useState('');
  const [monthlyExpenses, setMonthlyExpenses] = useState('');
  const [currentSavings, setCurrentSavings] = useState('');
  const [currentAge, setCurrentAge] = useState('0');
  const [targetAge, setTargetAge] = useState('60');
  const [targetAmount, setTargetAmount] = useState('1000000');
  const [annualReturn, setAnnualReturn] = useState(7);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [projections, setProjections] = useState(null);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    if (annual && monthlyExpenses && currentAge) {
      const yearlySavings = annual - (monthlyExpenses * 12);
      const initialAmount = parseFloat(currentSavings) || 0;
      const targetAmountNum = parseFloat(targetAmount) || 0;
      const returnRate = annualReturn / 100;
      const yearsToProject = targetAge - currentAge;
      
      // Generate data points for each year with age labels
      const labels = Array.from(
        { length: yearsToProject + 1 }, 
        (_, i) => parseInt(currentAge) + i
      );
      const dataPoints = labels.map((_, index) => 
        calculateFutureValue(yearlySavings, returnRate, index, initialAmount)
      );

      setChartData({
        labels,
        datasets: [
          {
            label: 'Portfolio Value',
            data: dataPoints,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
          },
          {
            label: 'Target Amount',
            data: labels.map(() => targetAmountNum),
            borderColor: 'rgba(239, 68, 68, 0.5)',
            borderDash: [5, 5],
            pointRadius: 0,
            fill: false,
          }
        ]
      });

      const yearsToTarget = calculateYearsToTarget(yearlySavings, returnRate, targetAmount, initialAmount);
      const targetAgeReached = parseInt(currentAge) + yearsToTarget;

      setProjections({
        yearlySavings,
        futureValue: dataPoints[dataPoints.length - 1],
        yearsToTarget,
        targetAge: targetAgeReached,
        finalAge: parseInt(targetAge)
      });
    }
  }, [annual, monthlyExpenses, currentAge, targetAge, targetAmount, currentSavings, annualReturn]);

  // Calculate future value with compound interest
  const calculateFutureValue = (yearlySavings, rate, years, initial) => {
    return initial * Math.pow(1 + rate, years) + 
           yearlySavings * ((Math.pow(1 + rate, years) - 1) / rate);
  };

  // Calculate years needed to reach target
  const calculateYearsToTarget = (yearlySavings, rate, target, initial) => {
    if (initial >= target) return 0;
    return Math.log((target * rate + yearlySavings) / (initial * rate + yearlySavings)) / Math.log(1 + rate);
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `$${context.parsed.y.toLocaleString(undefined, {
              maximumFractionDigits: 0
            })}`;
          }
        }
      },
      annotation: {
        annotations: {
          targetPoint: {
            type: 'point',
            xValue: projections?.yearsToTarget || 0,
            yValue: targetAmount,
            backgroundColor: 'rgb(239, 68, 68)', // Tailwind red-500
            radius: 6,
            borderWidth: 2,
            borderColor: 'white'
          },
          targetLine: {
            type: 'line',
            xMin: projections?.yearsToTarget || 0,
            xMax: projections?.yearsToTarget || 0,
            borderColor: 'rgb(239, 68, 68)', // Tailwind red-500
            borderWidth: 2,
          }
        }
      }
    },
    scales: {
      y: {
        ticks: {
          callback: function(value) {
            return '$' + value.toLocaleString(undefined, {
              maximumFractionDigits: 0
            });
          }
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">
          Quick FI Calculator
        </h1>
        
        {/* Core Financial Inputs */}
        <div className="space-y-4 mb-6">
          <div className="relative">
            <label className="block text-gray-700 mb-2">Annual Income</label>
            <span className="absolute left-3 top-[calc(50%+0.5rem)] transform -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              value={annual}
              onChange={(e) => setAnnual(parseFloat(e.target.value) || 0)}
              className="w-full pl-8 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter annual income"
              min="0"
            />
          </div>

          <div className="relative">
            <label className="block text-gray-700 mb-2">Monthly Expenses</label>
            <span className="absolute left-3 top-[calc(50%+0.5rem)] transform -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              value={monthlyExpenses}
              onChange={(e) => setMonthlyExpenses(parseFloat(e.target.value) || 0)}
              className="w-full pl-8 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter monthly expenses"
              min="0"
            />
          </div>

          {annual && monthlyExpenses && (
            <p className="text-gray-700">Yearly Savings: ${projections?.yearlySavings.toLocaleString()}</p>
          )}
        </div>

        {annual && monthlyExpenses && (
          <>
            {/* Investment Settings */}
            <div className="space-y-4 mb-6 p-4 bg-gray-50 rounded-md">
              <h3 className="font-semibold text-gray-700">Investment Settings</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-gray-700 mb-2">Return Rate (%)</label>
                  <input
                    type="number"
                    value={annualReturn}
                    onChange={(e) => setAnnualReturn(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Annual return"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
                <div className="relative">
                  <label className="block text-gray-700 mb-2">Current Savings</label>
                  <span className="absolute left-3 top-[calc(50%+0.5rem)] transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={currentSavings}
                    onChange={(e) => setCurrentSavings(parseFloat(e.target.value) || 0)}
                    className="w-full pl-8 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Starting amount"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Growth Chart */}
            {chartData && (
              <div className="mb-6 p-4 bg-gray-50 rounded-md">
                <h3 className="text-gray-700 font-semibold mb-4">Growth Projection</h3>
                <Line data={chartData} options={chartOptions} />
              </div>
            )}

            {/* Timeline Settings */}
            <div className="space-y-4 p-4 bg-gray-50 rounded-md">
              <h3 className="font-semibold text-gray-700">Timeline</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Current Age</label>
                  <input
                    type="number"
                    value={currentAge}
                    onChange={(e) => setCurrentAge(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your age"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Target Age</label>
                  <input
                    type="number"
                    value={targetAge}
                    onChange={(e) => setTargetAge(parseFloat(e.target.value) || 60)}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Retirement age"
                    min={currentAge}
                    max="100"
                  />
                </div>
              </div>

              {projections?.targetAge < projections?.finalAge && (
                <p className="text-green-600">
                  You'll reach your target at age {projections.targetAge.toFixed(1)}!
                </p>
              )}
            </div>

            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600">
                Need help figuring out your target amount? Visit{' '}
                <a 
                  href="https://ficalc.app" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600"
                >
                  FI Calculator
                </a>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
