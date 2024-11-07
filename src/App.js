import React, { useState } from 'react';
import { Plus } from "lucide-react";
import Course from './components/Course';

function App() {
  const [courses, setCourses] = useState([{
    name: '',
    credits: '3',
    target: '',
    categories: {}
  }]);
  const [gpa, setGpa] = useState(null);
  const [previousGpa, setPreviousGpa] = useState({ gpa: '', credits: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    const calculatedGpa = calculateGpa(courses);
    setGpa(calculatedGpa);
  };

  const handleCourseChange = (index, event, category = null) => {
    const newCourses = [...courses];
    if (category) {
      if (event.target.name === 'weight') {
        newCourses[index].categories[category].weight = parseFloat(event.target.value) || 0;
      } else {
        newCourses[index].categories[category][event.target.name] = event.target.value;
      }
    } else if (event.target.name === 'categories') {
      newCourses[index].categories = event.target.value;
    } else {
      newCourses[index][event.target.name] = event.target.value;
    }
    setCourses(newCourses);
  };

  const handleAddCourse = () => {
    setCourses([...courses, { name: '', credits: '3', target: '', categories: {} }]);
  };

  const handleRemoveCourse = (index) => {
    const newCourses = courses.filter((_, i) => i !== index);
    setCourses(newCourses);
  };

  const calculateGpa = (courses) => {
    let totalPoints = 0;
    let totalCredits = 0;

    if (previousGpa.gpa && previousGpa.credits) {
      const prevGpa = parseFloat(previousGpa.gpa);
      const prevCredits = parseFloat(previousGpa.credits);
      totalPoints += prevGpa * prevCredits;
      totalCredits += prevCredits;
    }

    for (const course of courses) {
      const credits = parseFloat(course.credits) || 0;
      const target = parseFloat(course.target);
      
      if (!target || !credits) continue;
      
      let points = 0;
      
      if (target >= 97) points = 4.333;      // A+
      else if (target >= 93) points = 4.0;   // A
      else if (target >= 90) points = 3.667; // A-
      else if (target >= 87) points = 3.333; // B+
      else if (target >= 83) points = 3.0;   // B
      else if (target >= 80) points = 2.667; // B-
      else if (target >= 77) points = 2.333; // C+
      else if (target >= 73) points = 2.0;   // C
      else if (target >= 70) points = 1.667; // C-
      else if (target >= 67) points = 1.333; // D+
      else if (target >= 63) points = 1.0;   // D
      else if (target >= 60) points = 0.667; // D-
      else points = 0.0;                     // F

      totalPoints += points * credits;
      totalCredits += credits;
    }

    return totalCredits === 0 ? 0 : totalPoints / totalCredits;
  };

  const handlePreviousGpaChange = (event) => {
    setPreviousGpa({
      ...previousGpa,
      [event.target.name]: event.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-3xl">
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6">
            <div className="space-y-8">
              <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                GPA Calculator
              </h1>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                  <h2 className="font-semibold text-gray-700">Previous GPA (Optional)</h2>
                  <div className="flex flex-col md:flex-row gap-4">
                    <input
                      className="px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      type="number"
                      placeholder="Previous GPA"
                      name="gpa"
                      value={previousGpa.gpa}
                      onChange={handlePreviousGpaChange}
                      min="0"
                      max="4.333"
                      step="0.001"
                    />
                    <input
                      className="px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      type="number"
                      placeholder="Total Credits Completed"
                      name="credits"
                      value={previousGpa.credits}
                      onChange={handlePreviousGpaChange}
                      min="0"
                    />
                  </div>
                </div>

                {courses.map((course, index) => (
                  <Course
                    key={index}
                    course={course}
                    index={index}
                    handleCourseChange={handleCourseChange}
                    handleRemoveCourse={handleRemoveCourse}
                  />
                ))}

                <div className="flex flex-col md:flex-row gap-4 justify-center">
                  <button
                    type="button"
                    className="flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
                    onClick={handleAddCourse}
                  >
                    <Plus className="h-4 w-4" />
                    Add Course
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Calculate GPA
                  </button>
                </div>
              </form>

              {gpa !== null && (
                <div className="w-full bg-gray-50 p-6 rounded-xl text-center">
                  <p className="text-sm text-gray-600 mb-1">
                    Your Cumulative GPA
                  </p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                    {gpa.toFixed(3)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
