import React, { useState, useEffect } from 'react';

function App() {
  const [annual, setAnnual] = useState('');
  const [monthly, setMonthly] = useState('');
  const [monthlyExpenses, setMonthlyExpenses] = useState('');
  const [targetAmount, setTargetAmount] = useState('1000000'); // Default $1M
  const [yearsToProject, setYearsToProject] = useState('10'); // Default 10 years
  const [projections, setProjections] = useState(null);

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
      
      // Calculate future value after specified years
      const futureValue = calculateFutureValue(yearlySavings, ANNUAL_RETURN, yearsToProject);
      
      // Calculate years needed to reach target
      const yearsToTarget = calculateYearsToTarget(yearlySavings, ANNUAL_RETURN, targetAmount);

      setProjections({
        yearlySavings,
        futureValue,
        yearsToTarget,
        targetDate: new Date(Date.now() + yearsToTarget * 365 * 24 * 60 * 60 * 1000)
      });
    }
  }, [annual, monthlyExpenses, targetAmount, yearsToProject]);

  // Calculate future value with compound interest
  const calculateFutureValue = (yearlySavings, rate, years) => {
    return yearlySavings * ((Math.pow(1 + rate, years) - 1) / rate);
  };

  // Calculate years needed to reach target
  const calculateYearsToTarget = (yearlySavings, rate, target) => {
    return Math.log(1 + (target * rate) / yearlySavings) / Math.log(1 + rate);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">
          Quick FI Calculator
        </h1>
        
        <div className="space-y-4">
          {/* Income and Expenses Section */}
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

          {projections && (
            <div className="space-y-4">
              <p className="text-gray-700 font-semibold">Based on {ANNUAL_RETURN * 100}% annual return:</p>
              <p className="text-gray-700">Yearly Savings: ${projections.yearlySavings.toLocaleString()}</p>
              
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
                    ${projections.futureValue.toLocaleString(undefined, {maximumFractionDigits: 0})}
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
                    {projections.yearsToTarget.toFixed(1)} years
                  </p>
                </div>
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
