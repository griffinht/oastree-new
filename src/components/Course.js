import React, { useState } from 'react';
import { Plus, Trash } from "lucide-react";

const getLetterGrade = (percentage) => {
  if (!percentage) return '';
  if (percentage >= 97) return 'A+';
  if (percentage >= 93) return 'A';
  if (percentage >= 90) return 'A-';
  if (percentage >= 87) return 'B+';
  if (percentage >= 83) return 'B';
  if (percentage >= 80) return 'B-';
  if (percentage >= 77) return 'C+';
  if (percentage >= 73) return 'C';
  if (percentage >= 70) return 'C-';
  if (percentage >= 67) return 'D+';
  if (percentage >= 63) return 'D';
  if (percentage >= 60) return 'D-';
  return 'F';
};

function Course({ course, index, handleCourseChange, handleRemoveCourse }) {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryWeight, setNewCategoryWeight] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

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
            total: 100,
            assignments: []
          }
        }
      }
    });
    
    setNewCategoryName('');
    setNewCategoryWeight('');
  };

  const handleAddAssignment = (categoryName) => {
    const newCategories = { ...course.categories };
    const category = newCategories[categoryName];
    
    category.assignments = [...(category.assignments || []), {
      name: `${categoryName} ${(category.assignments?.length || 0) + 1}`,
      earned: '',
      total: 100
    }];

    // Update the category's earned/total based on assignments
    if (category.assignments.length > 0) {
      const totalEarned = category.assignments.reduce((sum, a) => sum + (parseFloat(a.earned) || 0), 0);
      const totalPossible = category.assignments.reduce((sum, a) => sum + (parseFloat(a.total) || 0), 0);
      category.earned = totalEarned;
      category.total = totalPossible;
    }

    handleCourseChange(index, {
      target: {
        name: 'categories',
        value: newCategories
      }
    });
  };

  const handleAssignmentChange = (categoryName, assignmentIndex, field, value) => {
    const newCategories = { ...course.categories };
    const category = newCategories[categoryName];
    
    category.assignments[assignmentIndex][field] = value;

    // Update the category's earned/total
    const totalEarned = category.assignments.reduce((sum, a) => sum + (parseFloat(a.earned) || 0), 0);
    const totalPossible = category.assignments.reduce((sum, a) => sum + (parseFloat(a.total) || 0), 0);
    category.earned = totalEarned;
    category.total = totalPossible;

    handleCourseChange(index, {
      target: {
        name: 'categories',
        value: newCategories
      }
    });
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
    <div className={`space-y-4 p-4 border rounded-lg ${!course.included ? 'opacity-50' : ''}`}>
      <div className="flex justify-between items-start">
        <div className="flex flex-col md:flex-row gap-4 w-full">
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
            tabIndex="-1"
          >
            <svg
              className={`h-5 w-5 transform transition-transform ${isCollapsed ? '' : 'rotate-90'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={course.included}
              onChange={(e) => handleCourseChange(index, {
                target: {
                  name: 'included',
                  value: e.target.checked
                }
              })}
              className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
            />
            <input
              className="px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Course Name"
              name="name"
              value={course.name}
              onChange={(e) => handleCourseChange(index, e)}
            />
          </div>
          <div className="flex items-center gap-2">
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
            {course.target && (
              <span className={`text-sm font-medium ${
                getLetterGrade(parseFloat(course.target)).startsWith('A') ? 'text-green-600' :
                getLetterGrade(parseFloat(course.target)).startsWith('B') ? 'text-blue-600' :
                getLetterGrade(parseFloat(course.target)).startsWith('C') ? 'text-yellow-600' :
                getLetterGrade(parseFloat(course.target)).startsWith('D') ? 'text-orange-600' :
                'text-red-600'
              }`}>
                {getLetterGrade(parseFloat(course.target))}
              </span>
            )}
          </div>
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
          {isCollapsed && Object.keys(course.categories).length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Current:</span>
              <span className="font-medium">
                {calculateCurrentGrade()?.toFixed(1) || '-'}%
              </span>
              {calculateNeededScore() !== null && calculateNeededScore() > 100 && (
                <span className="text-red-500">⚠️</span>
              )}
            </div>
          )}
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

      <div className={`space-y-2 transition-all duration-200 ${isCollapsed ? 'hidden' : ''}`}>
        {/* Existing Categories */}
        {Object.entries(course.categories).map(([catName, category]) => (
          <div key={catName} className="space-y-2">
            <div className="flex items-center justify-between gap-4 p-2 bg-gray-50 rounded-lg">
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

            {/* Assignments section */}
            <div className="ml-8 space-y-2">
              {category.assignments?.map((assignment, assignmentIndex) => (
                <div key={assignmentIndex} className="flex items-center gap-4 p-2 bg-gray-100/50 rounded-lg">
                  <input
                    className="w-[100px] px-2 py-1 rounded-md border border-gray-300 text-sm"
                    value={assignment.name}
                    onChange={(e) => handleAssignmentChange(catName, assignmentIndex, 'name', e.target.value)}
                    placeholder={`${catName} ${assignmentIndex + 1}`}
                  />
                  <div className="flex items-center gap-2">
                    <input
                      className="w-16 px-2 py-1 rounded-md border border-gray-300 text-sm"
                      type="number"
                      value={assignment.earned}
                      onChange={(e) => handleAssignmentChange(catName, assignmentIndex, 'earned', e.target.value)}
                      min="0"
                      max={assignment.total}
                    />
                    <span className="text-gray-500">/</span>
                    <input
                      className="w-16 px-2 py-1 rounded-md border border-gray-300 text-sm"
                      type="number"
                      value={assignment.total}
                      onChange={(e) => handleAssignmentChange(catName, assignmentIndex, 'total', e.target.value)}
                      min="0"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newCategories = { ...course.categories };
                      newCategories[catName].assignments = category.assignments.filter((_, i) => i !== assignmentIndex);
                      
                      // Update category totals
                      const remaining = newCategories[catName].assignments;
                      const totalEarned = remaining.reduce((sum, a) => sum + (parseFloat(a.earned) || 0), 0);
                      const totalPossible = remaining.reduce((sum, a) => sum + (parseFloat(a.total) || 0), 0);
                      newCategories[catName].earned = totalEarned;
                      newCategories[catName].total = totalPossible;

                      handleCourseChange(index, {
                        target: {
                          name: 'categories',
                          value: newCategories
                        }
                      });
                    }}
                    className="text-red-500 hover:text-red-600"
                    tabIndex="-1"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              ))}
              
              {/* Add assignment button */}
              <button
                type="button"
                onClick={() => handleAddAssignment(catName)}
                className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                Add Assignment
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
                  if (newCategoryName.trim()) {
                    handleAddCategory();
                    // Focus on the category name input of the next new category
                    e.target.focus();
                  }
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
                  if (newCategoryName.trim()) {
                    handleAddCategory();
                    // Focus back on the category name input
                    const categoryNameInput = e.target.closest('.rounded-lg').querySelector('input[type="text"]');
                    categoryNameInput?.focus();
                  }
                }
              }}
              min="0"
              max="100"
            />
            <span className="text-sm text-gray-400">%</span>
            <button
              type="button"
              onClick={() => {
                if (newCategoryName.trim()) {
                  handleAddCategory();
                  // Focus back on the category name input
                  const categoryNameInput = document.querySelector('.border-dashed input[type="text"]');
                  categoryNameInput?.focus();
                }
              }}
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
                  To achieve {course.target}% in this course, you need to score{' '}
                  {calculateNeededScore() > 100 ? (
                    <span className="font-medium text-red-600">
                      over 100% ({calculateNeededScore().toFixed(1)}%)
                    </span>
                  ) : (
                    <>
                      at least{' '}
                      <span className="font-medium text-blue-600">
                        {calculateNeededScore().toFixed(1)}%
                      </span>
                    </>
                  )}{' '}
                  on remaining work.
                  {calculateNeededScore() > 100 && (
                    <span className="block mt-1 text-red-600 text-xs">
                      ⚠️ This target grade is not possible with current scores
                    </span>
                  )}
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