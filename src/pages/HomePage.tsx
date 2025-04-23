import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
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

  return (
    <div className="container mx-auto p-4 flex flex-col h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-center">QuickSlides</h1>
      <textarea
        value={content}
        onChange={handleContentChange}
        placeholder="Enter your slides here, separated by '---'"
        className="flex-grow resize-none mb-6 p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
      />
      <button
        onClick={handlePresent}
        className="self-center inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900"
      >
        <Play className="mr-2 h-5 w-5" /> Present
      </button>
    </div>
  );
};

export default HomePage; 