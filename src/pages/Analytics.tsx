import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import ReactMarkdown from "react-markdown";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  BarChart,
  Share,
  FileText,
  Printer,
  Download,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
} from "lucide-react";

interface ApiResponse {
  original_data?: {
    key_resources: string;
    problem: string;
    revenue_streams: string;
    solution: string;
    target_customers: string;
    user_input: string;
  };
  response?: string;
  status?: string;
  [key: string]: unknown;
}

const Analytics = () => {
  // Retrieve all fields from Redux
  const {
    user_input,
    problem,
    target_customers,
    solution,
    key_resources,
    revenue_streams,
  } = useSelector((state: RootState) => state.input);

  // State for API response, loading, and errors
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  // Call the validate API on component mount or when any input field changes
  useEffect(() => {
    const payload = {
      user_input,
      problem,
      target_customers,
      solution,
      key_resources,
      revenue_streams,
    };

    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(
          "https://idea-validator.onrender.com/validate",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
        if (!response.ok) {
          throw new Error("API response was not ok");
        }
        const data: ApiResponse = await response.json();
        setApiResponse(data);
        localStorage.setItem("canvasData", JSON.stringify(data.response));
        localStorage.setItem(
          "project_description",
          JSON.stringify(data.response)
        );
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || "Something went wrong");
        } else {
          setError("Something went wrong");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [
    user_input,
    problem,
    target_customers,
    solution,
    key_resources,
    revenue_streams,
  ]);

  // Function to copy analysis to clipboard
  const copyToClipboard = () => {
    if (apiResponse && apiResponse.response) {
      navigator.clipboard
        .writeText(apiResponse.response)
        .then(() => {
          setCopied(true);
          toast.success("Analysis copied to clipboard!");
          setTimeout(() => setCopied(false), 3000);
        })
        .catch((err) => {
          toast.error("Failed to copy text.");
          console.error("Copy failed: ", err);
        });
    }
  };

  // Function to handle printing
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow && apiResponse && apiResponse.response) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Business Analysis</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
              h1 { color: #333; }
              .content { margin-top: 20px; }
            </style>
          </head>
          <body>
            <h1>Business Analysis</h1>
            <div class="content">${apiResponse.response.replace(
              /\n/g,
              "<br>"
            )}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    } else {
      toast.error("Nothing to print");
    }
  };

  // Function to download analysis as text file
  const downloadAnalysis = () => {
    if (apiResponse && apiResponse.response) {
      const element = document.createElement("a");
      const file = new Blob([apiResponse.response], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
      element.download = "business_analysis.txt";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success("Analysis downloaded!");
    } else {
      toast.error("Nothing to download");
    }
  };

  // Function to navigate to charts page
  const goToCharts = () => {
    window.location.href = "/graphs";
  };

  const goToCanvas = () => {
    window.location.href = "/canvas";
  };

  // Function to refresh analysis
  const refreshAnalysis = async () => {
    if (!loading) {
      const payload = {
        user_input,
        problem,
        target_customers,
        solution,
        key_resources,
        revenue_streams,
      };

      setLoading(true);
      setError("");
      try {
        const response = await fetch(
          "https://idea-validator.onrender.com/validate",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
        if (!response.ok) {
          throw new Error("API response was not ok");
        }
        const data: ApiResponse = await response.json();
        setApiResponse(data);
        localStorage.setItem("canvasData", JSON.stringify(data.response));
        localStorage.setItem(
          "project_description",
          JSON.stringify(data.response)
        );
        toast.success("Analysis refreshed!");
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || "Something went wrong");
          toast.error(err.message || "Something went wrong");
        } else {
          setError("Something went wrong");
          toast.error("Something went wrong");
        }
      } finally {
        setLoading(false);
      }
    }
  };

  // Provide feedback functions
  const provideFeedback = (isPositive: boolean) => {
    if (isPositive) {
      toast.success("Thank you for your positive feedback!");
    } else {
      toast.info(
        "Thank you for your feedback. We'll work to improve the analysis."
      );
    }
  };

  return (
    <div className="flex-1 p-6 bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-black">Business Analysis</h1>
          <div className="flex space-x-3">
            <button
              onClick={refreshAnalysis}
              className="px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 text-gray-700 flex items-center gap-2 transition-colors"
              disabled={loading}
            >
              <RefreshCw
                size={16}
                className={`${loading ? "animate-spin" : ""}`}
              />
              {loading ? "Refreshing..." : "Refresh"}
            </button>
            <button
              onClick={goToCharts}
              className="px-3 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 flex items-center gap-2 transition-colors"
            >
              <BarChart size={16} />
              View Charts
            </button>
            <button
              onClick={goToCanvas}
              className="px-3 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 flex items-center gap-2 transition-colors"
            >
              <BarChart size={16} />
              View Canvas
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column: Input Data */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gray-800 text-white p-4">
              <h2 className="text-xl font-semibold">My Business Input</h2>
            </div>
            <div className="p-6 max-h-[700px] overflow-y-auto">
              {/* Display input fields in a structured way */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Problem Statement
                  </h3>
                  <p className="mt-1 text-gray-900">
                    {problem || "No problem statement provided."}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Target Customers
                  </h3>
                  <p className="mt-1 text-gray-900">
                    {target_customers || "No target customers specified."}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Solution
                  </h3>
                  <p className="mt-1 text-gray-900">
                    {solution || "No solution provided."}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Key Resources
                  </h3>
                  <p className="mt-1 text-gray-900">
                    {key_resources || "No key resources specified."}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Revenue Streams
                  </h3>
                  <p className="mt-1 text-gray-900">
                    {revenue_streams || "No revenue streams specified."}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Original Input
                  </h3>
                  <p className="mt-1 text-gray-900">
                    {user_input || "No original input provided."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Analysis */}
          <div className="bg-white text-black rounded-lg shadow-md overflow-hidden">
            <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Business Analysis</h2>
              <div className="flex space-x-1">
                <button
                  onClick={copyToClipboard}
                  title="Copy to clipboard"
                  className="p-1.5 rounded-md text-gray-200 hover:bg-gray-700 hover:text-white"
                >
                  {copied ? (
                    <span className="text-green-400">✓</span>
                  ) : (
                    <Share size={16} />
                  )}
                </button>
                <button
                  onClick={handlePrint}
                  title="Print analysis"
                  className="p-1.5 rounded-md text-gray-200 hover:bg-gray-700 hover:text-white"
                >
                  <Printer size={16} />
                </button>
                <button
                  onClick={downloadAnalysis}
                  title="Download as text"
                  className="p-1.5 rounded-md text-gray-200 hover:bg-gray-700 hover:text-white"
                >
                  <Download size={16} />
                </button>
              </div>
            </div>

            {/* API Response Content */}
            <div className="p-6 max-h-[700px] overflow-y-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
                  <p className="text-gray-600">
                    Analyzing your business inputs...
                  </p>
                </div>
              ) : error ? (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="prose prose-lg max-w-full">
                    <ReactMarkdown>
                      {apiResponse && apiResponse.response
                        ? apiResponse.response
                        : "No analysis available yet. Please provide information about your business idea."}
                    </ReactMarkdown>
                  </div>

                  {/* Feedback and Next Steps */}
                  {apiResponse && apiResponse.response && (
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">
                            Was this analysis helpful?
                          </h3>
                          <div className="mt-2 flex space-x-2">
                            <button
                              onClick={() => provideFeedback(true)}
                              className="px-3 py-1.5 bg-green-50 text-green-700 rounded border border-green-200 hover:bg-green-100 transition-colors flex items-center gap-1"
                            >
                              <ThumbsUp size={14} /> Yes
                            </button>
                            <button
                              onClick={() => provideFeedback(false)}
                              className="px-3 py-1.5 bg-gray-50 text-gray-700 rounded border border-gray-200 hover:bg-gray-100 transition-colors flex items-center gap-1"
                            >
                              <ThumbsDown size={14} /> No
                            </button>
                          </div>
                        </div>

                        <div>
                          <button
                            onClick={goToCharts}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-2"
                          >
                            View Charts <ArrowRight size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional action card */}
        <div className="mt-6 bg-gray-800 text-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">
                Ready to visualize your business data?
              </h2>
              <p className="mt-2 text-gray-300">
                Generate interactive charts and graphs based on your business
                analysis to gain deeper insights.
              </p>
            </div>
            <button
              onClick={goToCharts}
              className="px-6 py-3 bg-[#9FE870] text-black font-medium rounded-md hover:bg-[#8AD95F] transition-colors flex items-center gap-2 shadow-md"
            >
              <FileText size={18} />
              Generate Charts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
