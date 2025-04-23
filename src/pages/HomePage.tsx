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
    <div className="h-screen w-full bg-gray-100 p-4 flex items-center justify-center">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <h1 className="text-3xl font-bold text-center mb-6">QuickSlides</h1>
          
          <div className="mb-6 mx-8">
            <textarea
              value={content}
              onChange={handleContentChange}
              placeholder="Enter your slides here, separated by '---'"
              className="w-full h-96 p-4 border border-gray-300 rounded-md bg-gray-50 resize-none font-mono text-sm"
            />
          </div>
          
          <div className="flex justify-center gap-4">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 flex items-center hover:bg-gray-50"
            >
              <RotateCcw className="mr-2 h-4 w-4" /> Reset
            </button>
            <button
              onClick={handlePresent}
              className="px-4 py-2 bg-orange-500 text-white rounded-md flex items-center hover:bg-orange-600"
            >
              <Play className="mr-2 h-4 w-4" /> Present
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 