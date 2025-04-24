import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, RotateCcw } from 'lucide-react';
import defaultSlidesContent from '@/slides.md?raw'; // Import raw markdown content
import { Button } from '@/components/ui/button';

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
      <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <h1 className="text-3xl font-bold text-center !mb-6" style={{marginBottom: '1.5rem'}}>QuickSlides</h1>
          
          <div className="!my-6 !mx-8" style={{margin: '1.5rem 2rem'}}>
            <textarea
              value={content}
              onChange={handleContentChange}
              placeholder="Enter your slides here, separated by '---'"
              className="w-full h-96 p-4 border border-gray-300 rounded-md bg-gray-50 resize-none font-mono text-sm"
            />
          </div>
          
          <div className="flex justify-center gap-4 !mt-6" style={{marginTop: '1.5rem'}}>
            <Button 
              onClick={handleReset}
              className="flex items-center"
            >
              <RotateCcw className="mr-2 h-4 w-4" /> Reset
            </Button>
            <Button 
              onClick={handlePresent}
              className="flex items-center bg-orange-500 hover:bg-orange-600"
            >
              Present <Play className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 