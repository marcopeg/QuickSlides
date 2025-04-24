import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface SlideProps {
  content: string;
}

const Slide: React.FC<SlideProps> = ({ content }) => {
  // TODO: Add logic to detect single image and apply cover styles

  return (
    <div className="slide w-full h-full flex items-center justify-center p-8 overflow-hidden">
      {/* Apply prose for markdown styling, scoped within this component */}
      <div className="prose prose-invert max-w-none flex flex-col justify-center">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {String(content || "")}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default Slide;
