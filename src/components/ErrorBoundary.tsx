import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RotateCcw, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  showDetails: boolean;
  copied: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    showDetails: false,
    copied: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, showDetails: false, copied: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private copyToClipboard = () => {
    const errorText = `
Error Message: ${this.state.error?.message}
Stack Trace: ${this.state.error?.stack}
Timestamp: ${new Date().toISOString()}
URL: ${window.location.href}
    `.trim();

    navigator.clipboard.writeText(errorText).then(() => {
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    });
  };

  public render() {
    if (this.state.hasError) {
      let errorMessage = "Something went wrong.";
      let technicalDetails = this.state.error?.message || "";
      
      try {
        const parsed = JSON.parse(this.state.error?.message || "");
        if (parsed.error) {
          errorMessage = parsed.error;
          technicalDetails = JSON.stringify(parsed, null, 2);
        }
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-xl w-full bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-8 md:p-12 text-center space-y-8">
            <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle size={40} strokeWidth={1.5} />
            </div>
            
            <div className="space-y-3">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Application Error</h2>
              <p className="text-slate-500 font-medium leading-relaxed">
                {errorMessage}
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
              >
                <RotateCcw size={20} />
                Reload Application
              </button>

              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={() => this.setState({ showDetails: !this.state.showDetails })}
                  className="flex items-center justify-center gap-2 mx-auto text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
                >
                  {this.state.showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  {this.state.showDetails ? "Hide" : "Show"} Technical Details
                </button>

                {this.state.showDetails && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 text-left"
                  >
                    <div className="relative">
                      <pre className="bg-slate-900 text-slate-300 p-6 rounded-2xl text-[10px] font-mono overflow-auto max-h-64 leading-relaxed border border-white/10">
                        {technicalDetails}
                      </pre>
                      <button
                        onClick={this.copyToClipboard}
                        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
                      >
                        {this.state.copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                        {this.state.copied ? "Copied" : "Copy for Admin"}
                      </button>
                    </div>
                    <p className="mt-4 text-[10px] text-slate-400 text-center font-medium">
                      Please copy these details and send them to the administrator.
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
