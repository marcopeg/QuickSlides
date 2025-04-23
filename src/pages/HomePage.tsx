import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, RotateCcw } from 'lucide-react';
import defaultSlidesContent from '../slides.md?raw'; // Import raw markdown content

const LOCAL_STORAGE_KEY = 'quickslides-content';

const HomePage: React.FC = () => {
  const [content, setContent] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    // Load content from local storage or use default slides
    const storedContent = localStorage.getItem(LOCAL_STORAGE_KEY);
    setContent(storedContent ?? defaultSlidesContent);
  }, []);

  const handleContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = event.target.value;
    setContent(newContent);
    localStorage.setItem(LOCAL_STORAGE_KEY, newContent);
  };

  const handlePresent = () => {
    // Ensure latest content is saved before navigating
    localStorage.setItem(LOCAL_STORAGE_KEY, content);
    navigate('/slide/1');
  };

  // Function to reset content to default and clear localStorage
  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the content to the default slides? Any changes will be lost.')) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setContent(defaultSlidesContent);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 flex justify-center items-center">
      <div className="w-full max-w-4xl h-[90vh] flex flex-col bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-800 dark:text-gray-200">QuickSlides</h1>
        <textarea
          value={content}
          onChange={handleContentChange}
          placeholder="Enter your slides here, separated by '---'"
          className="flex-grow resize-none mt-2 mb-8 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm font-mono"
        />
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleReset}
            title="Reset content to default slides.md"
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
          >
            <RotateCcw className="mr-2 h-4 w-4" /> Reset
          </button>
          <button
            onClick={handlePresent}
            title="Present slides"
            className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900"
          >
            <Play className="mr-2 h-4 w-4" /> Present
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 