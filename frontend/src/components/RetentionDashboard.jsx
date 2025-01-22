import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const RetentionDashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [countries, setCountries] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [filters, setFilters] = useState({
    installDate: null,
    country: "",
    platform: "",
  });

  useEffect(() => {
    fetchMetrics();
    fetchCountries();
    fetchPlatforms();
  }, []);

  useEffect(() => {
    if (filters.installDate || filters.country || filters.platform) {
      fetchFilteredMetrics();
    }
  }, [filters]);

  const fetchMetrics = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        "http://localhost:4000/api/retention/getAllMetrics"
      );
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error("Error fetching metrics:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const fetchFilteredMetrics = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (filters.installDate) {
        params.append(
          "installDate",
          filters.installDate.toISOString().split("T")[0]
        );
      }
      if (filters.country) params.append("country", filters.country);
      if (filters.platform) params.append("platform", filters.platform);

      const response = await fetch(
        `http://localhost:4000/api/retention/getFilteredMetrics?${params}`
      );
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error("Error fetching filtered metrics:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const fetchCountries = async () => {
    const response = await fetch(
      "http://localhost:4000/api/retention/countries"
    );
    const data = await response.json();
    setCountries(data);
  };

  const fetchPlatforms = async () => {
    const response = await fetch(
      "http://localhost:4000/api/retention/platforms"
    );
    const data = await response.json();
    setPlatforms(data);
  };

  const getChartData = (metrics) => {
    if (!metrics) return [];
    return [
      {
        name: "D1",
        retention: parseFloat((metrics.d1.retention * 100).toFixed(2)),
        users: metrics.d1.retained,
      },
      {
        name: "D7",
        retention: parseFloat((metrics.d7.retention * 100).toFixed(2)),
        users: metrics.d7.retained,
      },
      {
        name: "D30",
        retention: parseFloat((metrics.d30.retention * 100).toFixed(2)),
        users: metrics.d30.retained,
      },
    ];
  };

  if (!metrics) {
    return <div className="p-6">Loading...</div>;
  }
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center h-[400px]">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Retention Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 bg-white p-4 rounded-lg shadow">
        <DatePicker
          selected={filters.installDate}
          onChange={(date) => setFilters({ ...filters, installDate: date })}
          placeholderText="Select install date"
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
        />

        <select
          name="country"
          id="country"
          value={filters.country}
          onChange={(e) => setFilters({ ...filters, country: e.target.value })}
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 text-black"
        >
          <option className="text-black" value="" disabled>
            🌍 Choose a country...
          </option>
          {countries.map((country) => (
            <option className="text-black" key={country} value={country}>
              {country}
            </option>
          ))}
        </select>

        <select
          value={filters.platform}
          onChange={(e) => setFilters({ ...filters, platform: e.target.value })}
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 text-black"
        >
          <option value="" disabled>
            📱 Select platform...
          </option>
          {platforms.map((platform) => (
            <option className="text-black" key={platform} value={platform}>
              {platform}
            </option>
          ))}
        </select>

        <button
          onClick={() => {
            setFilters({ installDate: null, country: "", platform: "" });
            fetchMetrics();
          }}
          className="w-full p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
        >
          Reset Filters
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Retention Overview
        </h3>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={getChartData(metrics)}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  stroke="#8884d8"
                  label={{
                    value: "Retention %",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#82ca9d"
                  label={{ value: "Users", angle: 90, position: "insideRight" }}
                />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === "retention") return `${value}%`;
                    return value.toLocaleString();
                  }}
                />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="retention"
                  fill="#8884d8"
                  name="Retention %"
                />
                <Bar
                  yAxisId="right"
                  dataKey="users"
                  fill="#82ca9d"
                  name="Retained Users"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          Array(4)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow p-6 animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))
        ) : (
          <>
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Total Installs
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                {metrics?.totalInstalls?.toLocaleString()}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                D1 Retention
              </h3>
              <p className="text-3xl font-bold text-green-600">
                {(metrics?.d1?.retention * 100).toFixed(2)}%
              </p>
              <p className="text-sm text-gray-500">
                {metrics?.d1?.retained?.toLocaleString()} users
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                D7 Retention
              </h3>
              <p className="text-3xl font-bold text-green-600">
                {(metrics?.d7?.retention * 100).toFixed(2)}%
              </p>
              <p className="text-sm text-gray-500">
                {metrics?.d7?.retained?.toLocaleString()} users
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                D30 Retention
              </h3>
              <p className="text-3xl font-bold text-green-600">
                {(metrics?.d30?.retention * 100).toFixed(2)}%
              </p>
              <p className="text-sm text-gray-500">
                {metrics?.d30?.retained?.toLocaleString()} users
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RetentionDashboard;
