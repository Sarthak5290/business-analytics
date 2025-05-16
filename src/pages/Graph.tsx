import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { RefreshCw } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Label,
} from "recharts";

// Type definitions
type ChartData = {
  revenue_distribution: RevenueDistributionData[];
  revenue_projection: RevenueProjectionData;
  customer_growth: CustomerGrowthData[];
  market_position: MarketPositionData;
  resource_allocation: ResourceAllocationData[];
  business_summary: BusinessSummary;
};

type RevenueDistributionData = {
  name: string;
  value: number;
};

type RevenueProjectionData = {
  data: RevenueProjectionItem[];
  keys: string[];
};

type RevenueProjectionItem = {
  name: string;
  [key: string]: string | number;
};

type CustomerGrowthData = {
  name: string;
  customers: number;
  type: string;
};

type MarketPositionData = {
  solution: {
    x: number;
    y: number;
    name: string;
  };
  quadrants: {
    name: string;
    x: number;
    y: number;
  }[];
};

type ResourceAllocationData = {
  name: string;
  allocation: number;
};

type BusinessSummary = {
  problem: string;
  target_customers: string;
  solution: string;
  key_resources: string;
  revenue_streams: string;
};

// Tooltip props types
type TooltipProps = {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: Record<string, unknown>;
    color: string;
  }>;
  label?: string;
};

// Recharts shape render props
type ShapeProps = {
  cx?: number;
  cy?: number;
  r?: number;
  payload?: Record<string, unknown>;
};

const GraphsPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [chartsGenerated, setChartsGenerated] = useState<boolean>(false);
  const [chartData, setChartData] = useState<ChartData | null>(null);

  // Get all the input fields from Redux store
  const inputData = useSelector((state: RootState) => state.input);

  // API endpoint for the Python backend
  const API_URL = "http://127.0.0.1:5050";

  // Colors for charts
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82CA9D",
    "#FFC658",
    "#8DD1E1",
    "#A4DE6C",
    "#D0ED57",
  ];

  const generateCharts = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/generate-data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inputData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setChartData(data);
      setChartsGenerated(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate charts when component mounts if we have data
  useEffect(() => {
    const hasData =
      inputData.problem ||
      inputData.target_customers ||
      inputData.solution ||
      inputData.key_resources ||
      inputData.revenue_streams;

    if (hasData) {
      generateCharts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Custom tooltip for Revenue Projection chart
  const RevenueProjectionTooltip = ({
    active,
    payload,
    label,
  }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded-md shadow-md">
          <p className="font-bold text-gray-700">{label}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {entry.name}: ${entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for Customer Growth chart
  const CustomerGrowthTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded-md shadow-md">
          <p className="font-bold text-gray-700">{label}</p>
          <p style={{ color: payload[0].color }}>
            Customers: {payload[0].value.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">
            {String(payload[0].payload.type)} Growth
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for Market Position chart
  const MarketPositionTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded-md shadow-md">
          <p className="font-bold text-gray-700">
            {String(payload[0].payload.name)}
          </p>
          <p>Uniqueness: {payload[0].value.toFixed(1)}/10</p>
          <p>Value: {payload[1].value.toFixed(1)}/10</p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for Resource Allocation chart
  const ResourceAllocationTooltip = ({
    active,
    payload,
    label,
  }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded-md shadow-md">
          <p className="font-bold text-gray-700">{label}</p>
          <p style={{ color: payload[0].color }}>
            Allocation: {payload[0].value.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom shape for quadrant labels
  const renderQuadrantLabel = (props: ShapeProps) => {
    const { cx = 0, cy = 0, payload } = props;
    if (!payload || !payload.name) return null;

    return (
      <text x={cx} y={cy} dy={5} textAnchor="middle" fill="#666" fontSize={10}>
        {payload.name}
      </text>
    );
  };

  // Custom shape for customer growth dot
  const renderCustomerGrowthDot = (props: ShapeProps) => {
    const { cx = 0, cy = 0, payload } = props;
    if (!payload) return null;

    // Special marker for the transition point
    if (
      chartData?.customer_growth[11] &&
      payload.name === chartData.customer_growth[11].name
    ) {
      return (
        <svg x={cx - 10} y={cy - 10} width={20} height={20} fill="red">
          <circle
            cx="10"
            cy="10"
            r="6"
            stroke="#8884d8"
            strokeWidth="2"
            fill="#fff"
          />
        </svg>
      );
    }
    return (
      <svg x={cx - 3} y={cy - 3} width={6} height={6} fill="#8884d8">
        <circle cx="3" cy="3" r="3" />
      </svg>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Business Analysis Charts</h1>

      {/* Input data summary */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">
          Business Model Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-bold text-gray-800">Problem</h3>
            <p className="text-gray-700 mt-1">
              {inputData.problem || "Not specified"}
            </p>
          </div>
          <div>
            <h3 className="font-bold text-gray-800">Target Customers</h3>
            <p className="text-gray-700 mt-1">
              {inputData.target_customers || "Not specified"}
            </p>
          </div>
          <div>
            <h3 className="font-bold text-gray-800">Solution</h3>
            <p className="text-gray-700 mt-1">
              {inputData.solution || "Not specified"}
            </p>
          </div>
          <div>
            <h3 className="font-bold text-gray-800">Key Resources</h3>
            <p className="text-gray-700 mt-1">
              {inputData.key_resources || "Not specified"}
            </p>
          </div>
          <div className="md:col-span-2">
            <h3 className="font-bold text-gray-800">Revenue Streams</h3>
            <p className="text-gray-700 mt-1">
              {inputData.revenue_streams || "Not specified"}
            </p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-4 mb-8">
        <button
          onClick={generateCharts}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors shadow-md flex items-center gap-2"
        >
          <RefreshCw className="w-5 h-5" />
          {loading ? "Generating..." : "Regenerate Charts"}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-6 rounded-r-lg shadow-md mb-8">
          <h3 className="font-bold text-lg">Error</h3>
          <p className="my-2">{error}</p>
          <p className="text-sm">
            Make sure the chart data API is running at {API_URL}
          </p>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center p-16 bg-white rounded-lg shadow-md">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-500 mb-4"></div>
          <p className="text-xl text-gray-700">Generating charts...</p>
          <p className="text-gray-500 mt-2">This may take a few moments</p>
        </div>
      )}

      {/* Charts display */}
      {chartsGenerated && chartData && !loading && (
        <div className="space-y-8">
          {/* Revenue Section */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <h3 className="bg-blue-50 p-4 font-semibold text-lg text-blue-800 border-b">
              Revenue Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              {/* Revenue Distribution */}
              <div className="border rounded-lg overflow-hidden shadow-sm">
                <div className="bg-gray-50 p-3 font-semibold">
                  Revenue Distribution
                </div>
                <div className="p-4 bg-white">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData.revenue_distribution}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(1)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.revenue_distribution.map((_entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [`$${value}`, "Revenue"]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                  <p className="mt-4 text-sm text-gray-600">
                    This pie chart shows the distribution of revenue across
                    different streams, indicating the relative contribution of
                    each source.
                  </p>
                </div>
              </div>

              {/* Revenue Projection */}
              <div className="border rounded-lg overflow-hidden shadow-sm">
                <div className="bg-gray-50 p-3 font-semibold">
                  Revenue Projection
                </div>
                <div className="p-4 bg-white">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={chartData.revenue_projection.data}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip content={<RevenueProjectionTooltip />} />
                      <Legend />
                      {chartData.revenue_projection.keys.map((key, index) => (
                        <Line
                          key={key}
                          type="monotone"
                          dataKey={key}
                          stroke={COLORS[index % COLORS.length]}
                          activeDot={{ r: 8 }}
                          strokeWidth={key === "Total" ? 2 : 1}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                  <p className="mt-4 text-sm text-gray-600">
                    This chart projects revenue growth over the next 12 months
                    for each revenue stream and the total.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Growth & Market Section */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <h3 className="bg-green-50 p-4 font-semibold text-lg text-green-800 border-b">
              Growth & Market Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              {/* Customer Growth */}
              <div className="border rounded-lg overflow-hidden shadow-sm">
                <div className="bg-gray-50 p-3 font-semibold">
                  Customer Growth Projection
                </div>
                <div className="p-4 bg-white">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={chartData.customer_growth}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10 }}
                        interval={3}
                      />
                      <YAxis />
                      <Tooltip content={<CustomerGrowthTooltip />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="customers"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                        strokeWidth={2}
                        connectNulls={true}
                        dot={renderCustomerGrowthDot}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="mt-4 text-sm text-gray-600">
                    <p>
                      This graph shows projected customer growth over 24 months.
                    </p>
                    <div className="flex items-center mt-2">
                      <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                      <span className="mr-4">Projected Growth</span>
                      <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                      <span>Prediction Start</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Market Position */}
              <div className="border rounded-lg overflow-hidden shadow-sm">
                <div className="bg-gray-50 p-3 font-semibold">
                  Market Position Analysis
                </div>
                <div className="p-4 bg-white">
                  <ResponsiveContainer width="100%" height={300}>
                    <ScatterChart
                      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    >
                      <CartesianGrid />
                      <XAxis
                        type="number"
                        dataKey="x"
                        name="Uniqueness"
                        domain={[0, 10]}
                        label={{ value: "Uniqueness", position: "bottom" }}
                      />
                      <YAxis
                        type="number"
                        dataKey="y"
                        name="Value"
                        domain={[0, 10]}
                        label={{
                          value: "Value Proposition",
                          angle: -90,
                          position: "left",
                        }}
                      />
                      <Tooltip content={<MarketPositionTooltip />} />
                      <Scatter
                        name="Quadrants"
                        data={chartData.market_position.quadrants}
                        fill="#8884d8"
                        shape={renderQuadrantLabel}
                      />
                      <Scatter
                        name="Your Solution"
                        data={[chartData.market_position.solution]}
                        fill="#FF8042"
                        shape="star"
                      >
                        <Label value="Your Solution" position="top" />
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                  <p className="mt-4 text-sm text-gray-600">
                    This quadrant chart positions your solution in the market
                    based on uniqueness and value proposition.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Resource Allocation Section */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <h3 className="bg-purple-50 p-4 font-semibold text-lg text-purple-800 border-b">
              Resource Allocation
            </h3>
            <div className="p-6">
              <div className="border rounded-lg overflow-hidden shadow-sm">
                <div className="bg-gray-50 p-3 font-semibold">
                  Resource Allocation Recommendation
                </div>
                <div className="p-4 bg-white">
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      data={chartData.resource_allocation}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis
                        dataKey="name"
                        type="category"
                        width={80}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip content={<ResourceAllocationTooltip />} />
                      <Legend />
                      <Bar
                        dataKey="allocation"
                        fill="#8884d8"
                        label={{
                          position: "right",
                          formatter: (value: number) => `${value.toFixed(1)}%`,
                        }}
                      >
                        {chartData.resource_allocation.map((_entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="mt-4 text-sm text-gray-600">
                    This chart shows the recommended allocation of resources
                    based on your business model. The percentages indicate the
                    relative importance of each resource.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Conclusions Section */}
          <div className="bg-white text-black rounded-lg shadow-md overflow-hidden">
            <h3 className="bg-yellow-50 p-4 font-semibold text-lg text-yellow-800 border-b">
              Conclusions and Recommendations
            </h3>
            <div className="p-6">
              <div className="border rounded-lg overflow-hidden shadow-sm">
                <div className="bg-gray-50 p-3 font-semibold">
                  Business Analysis Summary
                </div>
                <div className="p-6 bg-white">
                  <h4 className="font-semibold text-gray-800 mb-3">
                    Key Insights:
                  </h4>

                  <ul className="list-disc pl-5 space-y-2 mb-5">
                    <li>
                      Your business shows potential for growth in the identified
                      market segments
                    </li>
                    <li>
                      Revenue projections indicate a positive trend, with the
                      strongest growth in
                      {chartData &&
                        chartData.revenue_projection.keys.length > 0 &&
                        ` the ${chartData.revenue_projection.keys[0]} revenue stream`}
                    </li>
                    <li>
                      The market position suggests{" "}
                      {chartData &&
                      chartData.market_position.solution.x > 5 &&
                      chartData.market_position.solution.y > 5
                        ? "you have a competitive advantage as a market leader"
                        : chartData && chartData.market_position.solution.x > 5
                        ? "you have an emerging solution with high uniqueness"
                        : chartData && chartData.market_position.solution.y > 5
                        ? "you have a niche player position with high value"
                        : "you should consider increasing uniqueness and value proposition"}
                    </li>
                    <li>
                      Resource allocation should focus on{" "}
                      {chartData && chartData.resource_allocation.length > 0
                        ? `${
                            chartData.resource_allocation[0].name
                          } (${chartData.resource_allocation[0].allocation.toFixed(
                            1
                          )}%)`
                        : "key areas"}{" "}
                      to maximize efficiency
                    </li>
                  </ul>

                  <h4 className="font-semibold text-gray-800 mb-3">
                    Next Steps:
                  </h4>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Validate revenue assumptions with market testing</li>
                    <li>
                      Review customer acquisition strategy to align with
                      projected growth
                    </li>
                    <li>
                      Regularly update projections based on actual performance
                      data
                    </li>
                    <li>
                      Consider adjusting resource allocation based on market
                      feedback
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No data state */}
      {!chartsGenerated && !loading && !error && (
        <div className="text-center p-16 bg-white rounded-lg shadow-md">
          <svg
            className="w-20 h-20 mx-auto text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-6 text-xl font-medium text-gray-900">
            No charts generated yet
          </h3>
          <p className="mt-3 text-gray-500 max-w-md mx-auto">
            Enter business model information in the previous steps and click
            'Generate Charts' to analyze your business.
          </p>
          <button
            onClick={generateCharts}
            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            Generate Charts
          </button>
        </div>
      )}
    </div>
  );
};

export default GraphsPage;
