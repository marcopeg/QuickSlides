import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class SlideErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error in slide:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="w-full h-full flex items-center justify-center bg-destructive/20 text-destructive-foreground p-4 border border-destructive rounded-md">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Slide Error</h2>
            <p className="text-sm mb-4">
              There was an error rendering this slide. Please check the
              Markdown/HTML syntax.
            </p>
            {/* Optionally display error details during development */}
            {import.meta.env.DEV && this.state.error && (
              <pre className="bg-destructive/30 p-2 rounded text-xs overflow-auto">
                <code>{this.state.error.toString()}</code>
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default SlideErrorBoundary;
