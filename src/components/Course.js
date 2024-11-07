import React, { useState } from 'react';
import { Plus, Trash } from "lucide-react";

function Course({ course, index, handleCourseChange, handleRemoveCourse }) {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryWeight, setNewCategoryWeight] = useState('');

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    
    const weight = parseFloat(newCategoryWeight) || 0;
    handleCourseChange(index, {
      target: {
        name: 'categories',
        value: {
          ...course.categories,
          [newCategoryName.toLowerCase()]: {
            weight,
            earned: '',
            total: 100
          }
        }
      }
    });
    
    setNewCategoryName('');
    setNewCategoryWeight('');
  };

  const calculateCurrentGrade = () => {
    let totalEarned = 0;
    let totalPossibleWeight = 0;

    Object.values(course.categories).forEach(category => {
      const earned = parseFloat(category.earned) || 0;
      const total = parseFloat(category.total) || 0;
      const weight = parseFloat(category.weight) || 0;

      if (total > 0) {
        totalEarned += (earned / total) * weight;
        totalPossibleWeight += weight;
      }
    });

    return totalPossibleWeight === 0 ? null : (totalEarned / totalPossibleWeight * 100);
  };

  const calculateNeededScore = () => {
    const target = parseFloat(course.target);
    if (!target) return null;

    const categories = course.categories;
    let earnedPoints = 0;
    let remainingWeight = 0;

    // Calculate points already earned
    Object.values(categories).forEach(cat => {
      const earned = parseFloat(cat.earned);
      const total = parseFloat(cat.total);
      const weight = parseFloat(cat.weight) || 0;
      
      if (!isNaN(earned) && !isNaN(total) && total > 0) {
        earnedPoints += (earned / total) * weight;
      } else {
        remainingWeight += weight;
      }
    });

    // Calculate needed percentage in remaining categories
    const neededPoints = target - earnedPoints;
    const neededPercentage = (neededPoints / remainingWeight) * 100;

    return isFinite(neededPercentage) ? neededPercentage : null;
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="flex justify-between items-start">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            className="px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Course Name"
            name="name"
            value={course.name}
            onChange={(e) => handleCourseChange(index, e)}
          />
          <input
            className="px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Target Grade"
            name="target"
            type="number"
            min="0"
            max="100"
            value={course.target}
            onChange={(e) => handleCourseChange(index, e)}
          />
          <input
            className="px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            type="number"
            placeholder="Credits"
            name="credits"
            value={course.credits}
            onChange={(e) => handleCourseChange(index, e)}
            min="0"
            max="6"
            required
          />
        </div>
        <button
          type="button"
          onClick={() => {
            if (window.confirm('Are you sure you want to remove this course?')) {
              handleRemoveCourse(index);
            }
          }}
          className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-md"
          tabIndex="-1"
        >
          <Trash className="h-4 w-4" />
        </button>
      </div>

      {/* Categories Section */}
      <div className="space-y-2">
        {/* Existing Categories */}
        {Object.entries(course.categories).map(([catName, category]) => (
          <div key={catName} className="flex items-center justify-between gap-4 p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <input
                className="w-[100px] px-2 py-1 rounded-md border border-gray-300 text-sm font-medium focus:outline-none"
                value={catName}
                onChange={(e) => {
                  const newCategories = { ...course.categories };
                  const categoryData = newCategories[catName];
                  delete newCategories[catName];
                  newCategories[e.target.value.toLowerCase()] = categoryData;
                  handleCourseChange(index, {
                    target: {
                      name: 'categories',
                      value: newCategories
                    }
                  });
                }}
                tabIndex="-1"
                onClick={(e) => e.target.select()}
              />
              <div className="flex items-center gap-2">
                <input
                  className="w-20 px-2 py-1 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  type="number"
                  placeholder="Earned"
                  name="earned"
                  value={category.earned}
                  onChange={(e) => handleCourseChange(index, e, catName)}
                  min="0"
                  max={category.total}
                />
                <span className="text-gray-500">/</span>
                <input
                  className="w-20 px-2 py-1 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  type="number"
                  placeholder="Total"
                  name="total"
                  value={category.total}
                  onChange={(e) => handleCourseChange(index, e, catName)}
                  min="0"
                  tabIndex="-1"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Weight:</span>
              <input
                className="w-16 px-2 py-1 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                type="number"
                name="weight"
                value={category.weight}
                onChange={(e) => handleCourseChange(index, e, catName)}
                min="0"
                max="100"
                tabIndex="-1"
              />
              <span className="text-sm text-gray-500">%</span>
              <button
                type="button"
                onClick={() => {
                  const newCategories = { ...course.categories };
                  delete newCategories[catName];
                  handleCourseChange(index, {
                    target: {
                      name: 'categories',
                      value: newCategories
                    }
                  });
                }}
                className="p-1 text-red-500 hover:text-red-600"
                tabIndex="-1"
              >
                <Trash className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        
        {/* New Category Row */}
        <div className="flex items-center justify-between gap-4 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 border-2 border-dashed border-gray-300">
          <div className="flex items-center gap-2">
            <input
              className="w-[100px] px-2 py-1 rounded-md border border-gray-300 text-sm font-medium"
              type="text"
              placeholder="homework"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCategory();
                }
              }}
            />
            <div className="flex items-center gap-2">
              <input
                className="w-20 px-2 py-1 rounded-md border border-gray-300 bg-gray-50"
                type="number"
                placeholder="95"
                disabled
              />
              <span className="text-gray-400">/</span>
              <input
                className="w-20 px-2 py-1 rounded-md border border-gray-300 bg-gray-50"
                type="number"
                placeholder="100"
                disabled
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Weight:</span>
            <input
              className="w-16 px-2 py-1 rounded-md border border-gray-300"
              type="number"
              placeholder="15"
              value={newCategoryWeight}
              onChange={(e) => setNewCategoryWeight(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCategory();
                }
              }}
              min="0"
              max="100"
            />
            <span className="text-sm text-gray-400">%</span>
            <button
              type="button"
              onClick={handleAddCategory}
              className="p-1 text-green-500 hover:text-green-600"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Summary Rows */}
        {Object.keys(course.categories).length > 0 && (
          <>
            <div className="flex items-center justify-between gap-4 p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 capitalize min-w-[100px]">
                  Total Grade
                </span>
                <div className="flex items-center gap-2">
                  <input
                    className="w-20 px-2 py-1 rounded-md border border-gray-300 bg-gray-100"
                    type="number"
                    value={calculateCurrentGrade()?.toFixed(1) || ''}
                    disabled
                  />
                  <span className="text-gray-500">/</span>
                  <input
                    className="w-20 px-2 py-1 rounded-md border border-gray-300 bg-gray-100"
                    type="number"
                    value={course.target || 100}
                    disabled
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Weight:</span>
                <input
                  className={`w-16 px-2 py-1 rounded-md border ${
                    Object.values(course.categories).reduce((sum, cat) => sum + (parseFloat(cat.weight) || 0), 0) !== 100
                    ? 'border-amber-300 bg-amber-50'
                    : 'border-gray-300 bg-gray-100'
                  }`}
                  type="number"
                  value={Object.values(course.categories).reduce((sum, cat) => sum + (parseFloat(cat.weight) || 0), 0)}
                  disabled
                />
                <span className="text-sm text-gray-500">%</span>
              </div>
            </div>
            
            {calculateNeededScore() !== null && (
              <div className="p-2 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  To achieve {course.target}% in this course, you need to score at least{' '}
                  <span className="font-medium text-blue-600">
                    {calculateNeededScore().toFixed(1)}%
                  </span>
                  {' '}on remaining work.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Course; 