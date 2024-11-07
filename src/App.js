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
  const [monthly, setMonthly] = useState('');
  const [monthlyExpenses, setMonthlyExpenses] = useState('');
  const [currentSavings, setCurrentSavings] = useState('');
  const [targetAmount, setTargetAmount] = useState('1000000'); // Default $1M
  const [yearsToProject, setYearsToProject] = useState('10'); // Default 10 years
  const [projections, setProjections] = useState(null);
  const [chartData, setChartData] = useState(null);

  const ANNUAL_RETURN = 0.07; // 7% annual return

  const updateAnnual = (value) => {
    const numValue = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
    setAnnual(numValue);
    setMonthly((numValue / 12).toFixed(2));
  };

  const updateMonthly = (value) => {
    const numValue = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
    setMonthly(numValue);
    setAnnual((numValue * 12).toFixed(2));
  };

  useEffect(() => {
    if (annual && monthlyExpenses) {
      const yearlySavings = annual - (monthlyExpenses * 12);
      const initialAmount = parseFloat(currentSavings) || 0;
      const targetAmountNum = parseFloat(targetAmount) || 0;
      
      // Generate data points for each year
      const labels = Array.from({ length: parseInt(yearsToProject) + 1 }, (_, i) => i);
      const dataPoints = labels.map(year => 
        calculateFutureValue(yearlySavings, ANNUAL_RETURN, year, initialAmount)
      );

      // Create target line data
      const targetLineData = labels.map(() => targetAmountNum);

      setChartData({
        labels,
        datasets: [
          {
            label: 'Portfolio Value',
            data: dataPoints,
            borderColor: 'rgb(59, 130, 246)', // Tailwind blue-500
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
          },
          {
            label: 'Target Amount',
            data: targetLineData,
            borderColor: 'rgba(239, 68, 68, 0.5)', // Tailwind red-500
            borderDash: [5, 5],
            pointRadius: 0,
            fill: false,
          }
        ]
      });

      // Calculate future value including current savings
      const futureValue = calculateFutureValue(yearlySavings, ANNUAL_RETURN, yearsToProject, initialAmount);
      
      // Calculate years needed to reach target
      const yearsToTarget = calculateYearsToTarget(yearlySavings, ANNUAL_RETURN, targetAmount, initialAmount);

      setProjections({
        yearlySavings,
        futureValue,
        yearsToTarget,
        targetDate: new Date(Date.now() + yearsToTarget * 365 * 24 * 60 * 60 * 1000)
      });
    }
  }, [annual, monthlyExpenses, targetAmount, yearsToProject, currentSavings]);

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
        
        <div className="space-y-4">
          {/* Initial Income and Expenses Section */}
          <div className="space-y-4 mb-6">
            <div className="relative">
              <label className="block text-gray-700 mb-2">Annual Income</label>
              <span className="absolute left-3 top-[calc(50%+0.5rem)] transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={annual}
                onChange={(e) => updateAnnual(e.target.value)}
                className="w-full pl-8 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter annual income"
                min="0"
              />
            </div>

            <div className="relative">
              <label className="block text-gray-700 mb-2">Monthly Income</label>
              <span className="absolute left-3 top-[calc(50%+0.5rem)] transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={monthly}
                onChange={(e) => updateMonthly(e.target.value)}
                className="w-full pl-8 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter monthly income"
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
          </div>

          {/* Show advanced options only after initial inputs are filled */}
          {annual && monthlyExpenses && (
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-gray-700 mb-2">Current Savings</label>
                <span className="absolute left-3 top-[calc(50%+0.5rem)] transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={currentSavings}
                  onChange={(e) => setCurrentSavings(parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter current savings"
                  min="0"
                />
              </div>

              <p className="text-gray-700 font-semibold">Based on {ANNUAL_RETURN * 100}% annual return:</p>
              <p className="text-gray-700">Yearly Savings: ${projections?.yearlySavings.toLocaleString()}</p>
              
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="block text-gray-700 mb-2">Years to Project</label>
                  <input
                    type="number"
                    value={yearsToProject}
                    onChange={(e) => setYearsToProject(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Years"
                    min="0"
                  />
                </div>
                <div className="flex-1 pt-8">
                  <p className="text-gray-700 font-semibold">
                    ${projections?.futureValue.toLocaleString(undefined, {maximumFractionDigits: 0})}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="block text-gray-700 mb-2">Target Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={targetAmount}
                      onChange={(e) => setTargetAmount(parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Target $"
                      min="0"
                    />
                  </div>
                </div>
                <div className="flex-1 pt-8">
                  <p className="text-gray-700 font-semibold">
                    {projections?.yearsToTarget.toFixed(1)} years
                  </p>
                </div>
              </div>

              {/* Add chart before the FI Calculator link */}
              {chartData && (
                <div className="mt-6 p-4 bg-gray-50 rounded-md">
                  <h3 className="text-gray-700 font-semibold mb-4">Growth Projection</h3>
                  <Line data={chartData} options={chartOptions} />
                </div>
              )}

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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
