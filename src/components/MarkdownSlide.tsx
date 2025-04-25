import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

interface MarkdownSlideProps {
  content: string;
}

// Renamed component from Slide to MarkdownSlide
const MarkdownSlide: React.FC<MarkdownSlideProps> = ({ content }) => {
  // Removed TODO comment about image detection

  return (
    // Added padding back here, removed from dispatcher
    <div className="markdown-slide w-full h-full flex items-center justify-center p-8 overflow-hidden">
      {/* Apply prose for markdown styling, scoped within this component */}
      <div
        className="prose prose-invert max-w-none flex flex-col justify-center 
                   [&_h1]:text-5xl [&_h1]:font-bold [&_h1]:mb-4 
                   [&_h2]:text-4xl [&_h2]:font-semibold [&_h2]:mb-3 
                   [&_h3]:text-3xl [&_h3]:font-medium [&_h3]:mb-2 
                   [&_p]:text-xl [&_p]:leading-relaxed [&_p]:mb-4 
                   [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 
                   [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 
                   [&_li]:mb-2 
                   [&_a]:text-blue-400 [&_a]:underline hover:[&_a]:text-blue-300"
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            a: ({ ...props }) => (
              <a {...props} target="_blank" rel="noopener noreferrer" />
            ),
          }}
        >
          {String(content || "")}
        </ReactMarkdown>
      </div>
    </div>
  );
};

// Updated export
export default MarkdownSlide;
