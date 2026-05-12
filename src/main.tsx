import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { isMissingEnv } from "./lib/supabase";

/**
 * A simple error boundary to catch top-level crashes 
 * and prevent the dreaded white screen.
 */
class GlobalErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("[Meclones] Root Crash:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-navy flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-white p-8 border-t-4 border-gold shadow-2xl">
            <h1 className="text-2xl font-black text-navy mb-4">APPLICATION CRASH</h1>
            <p className="text-sm text-muted-foreground mb-6">
              The application encountered a critical error and could not start.
            </p>
            <div className="bg-rose-50 border border-rose-100 p-4 mb-6">
              <code className="text-xs text-rose-600 break-all">{this.state.error?.message}</code>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-navy text-gold py-3 font-bold text-xs tracking-wider hover:bg-navy/90 transition"
            >
              RETRY CONNECTION
            </button>
            <p className="mt-6 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
              Error code: ROOT_LEVEL_INITIALIZATION_FAIL
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const root = document.getElementById("root");

if (root) {
  createRoot(root).render(
    <React.StrictMode>
      <GlobalErrorBoundary>
        <App />
        
        {/* Diagnostic indicator for the developer */}
        {isMissingEnv && (
          <div className="fixed bottom-4 right-4 z-[9999] bg-rose-600 text-white px-3 py-1.5 text-[10px] font-bold rounded shadow-lg flex items-center gap-2 animate-pulse">
            <span className="w-2 h-2 bg-white rounded-full" />
            SUPABASE_CONFIG_MISSING
          </div>
        )}
      </GlobalErrorBoundary>
    </React.StrictMode>
  );
}
