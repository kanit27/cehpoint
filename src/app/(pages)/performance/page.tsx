'use client';

import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import Footers from "../../components/Footers";
import axiosInstance from "../../../lib/axios";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import moment from "moment";

interface PerformanceScore {
  projectCount: number;
  courseCount: number;
  quizScoreAvg: number;
  averageProgress: number;
}

interface DailyPerformanceEntry {
  date: string;
  count: number;
}

interface PerformanceData {
  max_strick: number;
  strick: number;
  dailyPerformance: DailyPerformanceEntry[];
  performanceScore: PerformanceScore;
}

const PerformancePage: React.FC = () => {
  const [userUID, setUserUID] = useState<string | null>(null);
  const [data, setData] = useState<PerformanceData | null>(null);
  const [performanceScore, setPerformanceScore] = useState<PerformanceScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [globalUpdateDone, setGlobalUpdateDone] = useState(false);
  const [courseCompletionData, setCourseCompletionData] = useState<DailyPerformanceEntry[]>([]);

  useEffect(() => {
    setUserUID(sessionStorage.getItem("uid"));
  }, []);

  const fetchPerformanceAll = async () => {
    try {
      await axiosInstance.get(`/api/performance/all`);
      await axiosInstance.post("/api/updateCountsForAllUsers");
      setGlobalUpdateDone(true);
    } catch (error) {
      console.error("Error updating all user performance data:", error);
    }
  };

  const fetchPerformance = async () => {
    if (!userUID) return;
    try {
      const response = await axiosInstance.get(`/api/performance/${userUID}`);
      const performanceData = response?.data?.data;

      if (response?.data?.success && performanceData) {
        setData(performanceData);
        setPerformanceScore(performanceData?.performanceScore);

        const dailyPerformance = performanceData?.dailyPerformance || [];
        dailyPerformance.sort((a: DailyPerformanceEntry, b: DailyPerformanceEntry) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        const updatedCourseCompletionData = dailyPerformance.map((entry) => ({
          date: moment(entry.date).format("YYYY-MM-DD"),
          count: entry.count || 0,
        }));

        setCourseCompletionData(updatedCourseCompletionData);
      } else {
        setData(null);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching user performance data:", error);
      setLoading(false);
      setOpenSnackbar(true);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!userUID) {
        setLoading(false);
        return;
      }
      if (!globalUpdateDone) {
        await fetchPerformanceAll();
      }
      await fetchPerformance();
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userUID, globalUpdateDone]);

  // Criteria
  const projectCountCriteria = 1;
  const courseCountCriteria = 5;
  const quizScoreAvgCriteria = 25;
  const averageProgressCriteria = 100;

  const projectCount = performanceScore?.projectCount || 0;
  const courseCount = performanceScore?.courseCount || 0;
  const quizScoreAvg = parseFloat((performanceScore?.quizScoreAvg || 0).toFixed(2));
  const averageProgress = parseFloat(((performanceScore?.averageProgress || 0) / 500).toFixed(2));

  const projectCountCompletion = projectCount >= projectCountCriteria ? 100 : 0;
  const courseCountCompletion = Math.min((courseCount / courseCountCriteria) * 100, 100);
  const quizScoreAvgCompletion = Math.min((quizScoreAvg / quizScoreAvgCriteria) * 100, 100);
  const averageProgressCompletion = Math.min((averageProgress / averageProgressCriteria) * 100, 100);

  const totalCompletionPercentage =
    (projectCountCompletion +
      courseCountCompletion +
      quizScoreAvgCompletion +
      averageProgressCompletion) /
    4;

  const completionPercentage = totalCompletionPercentage.toFixed(2);

  // Generate all dates in the past year
  const generateFullYearData = () => {
    const startOfYear = moment().startOf("year").format("YYYY-MM-DD");
    const endOfYear = moment().endOf("year").format("YYYY-MM-DD");

    const fullYearData: DailyPerformanceEntry[] = [];
    for (
      let date = moment(startOfYear);
      date.isBefore(endOfYear);
      date.add(1, "days")
    ) {
      const foundEntry = courseCompletionData.find(
        (entry) => entry.date === date.format("YYYY-MM-DD")
      );
      fullYearData.push(
        foundEntry || { date: date.format("YYYY-MM-DD"), count: 0 }
      );
    }
    return fullYearData;
  };

  const heatmapData = generateFullYearData();

  return (
    <div className="h-screen flex flex-col overflow-x-hidden">
      <Header isHome={true} className="sticky top-0 z-50" />
      <div className="flex-1 bg-gray-900 text-white p-4 flex flex-col items-center">
        <h2 className="text-lg font-bold mb-4">Performance Overview</h2>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <svg className="animate-spin h-8 w-8 text-yellow-400 mr-2" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            <span className="ml-2">Loading data...</span>
          </div>
        ) : (
          <div className="w-full mb-4 flex items-center justify-center">
            <div className="flex items-center justify-center max-md:flex-col gap-x-10">
              {/* Circular Progress */}
              <div className="relative mr-2">
                <svg className="w-56 h-56">
                  <circle
                    className="text-gray-700"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r="100"
                    cx="112"
                    cy="112"
                  />
                  <circle
                    className="text-yellow-400"
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 100}
                    strokeDashoffset={
                      2 * Math.PI * 100 * (1 - Number(completionPercentage) / 100)
                    }
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="100"
                    cx="112"
                    cy="112"
                  />
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dy=".3em"
                    className="text-3xl font-bold fill-white"
                  >
                    {`${Math.round(Number(completionPercentage))}%`}
                  </text>
                </svg>
              </div>
              {/* Progress Bars */}
              <div className="flex flex-col gap-4 w-full">
                {/* Project Count */}
                <div>
                  <div className="mb-1 text-white font-semibold">
                    Project Count: {projectCount}/{projectCountCriteria}
                  </div>
                  <div className="w-72 h-3 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-3 bg-yellow-400 rounded-full"
                      style={{ width: `${projectCountCompletion}%` }}
                    />
                  </div>
                </div>
                {/* Course Count */}
                <div>
                  <div className="mb-1 text-white font-semibold">
                    Course Count: {courseCount}/{courseCountCriteria}
                  </div>
                  <div className="w-72 h-3 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-3 bg-yellow-400 rounded-full"
                      style={{ width: `${courseCountCompletion}%` }}
                    />
                  </div>
                </div>
                {/* Quiz Score Average */}
                <div>
                  <div className="mb-1 text-white font-semibold">
                    Quiz Score Average: {quizScoreAvg}/{quizScoreAvgCriteria} %
                  </div>
                  <div className="w-72 h-3 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-3 bg-yellow-400 rounded-full"
                      style={{ width: `${quizScoreAvgCompletion}%` }}
                    />
                  </div>
                </div>
                {/* Average Progress */}
                <div>
                  <div className="mb-1 text-white font-semibold">
                    Average Progress: {averageProgress}/{averageProgressCriteria} %
                  </div>
                  <div className="w-72 h-3 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-3 bg-yellow-400 rounded-full"
                      style={{ width: `${averageProgressCompletion}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded-lg shadow-md my-4 w-full max-w-2xl">
          <h3 className="text-md font-semibold mb-2">Important Note:</h3>
          <p className="text-xs mb-2">
            To proceed with the test, you need to meet the following criteria:
          </p>
          <ul className="list-disc list-inside pl-4 text-xs">
            <li>
              <span className="font-medium">Project Count:</span> Complete at
              least <strong>1 project</strong>.
            </li>
            <li>
              <span className="font-medium">Course Count:</span> Complete at
              least <strong>5 courses</strong>.
            </li>
            <li>
              <span className="font-medium">Average Quiz Score:</span> Achieve a
              minimum score of <strong>25</strong>.
            </li>
            <li>
              <span className="font-medium">Average Progress:</span> Maintain{" "}
              <strong>100% progress</strong> in your courses.
            </li>
          </ul>
          <p className="text-xs mt-2">
            Please ensure these requirements are met before starting the test.
            Good luck!
          </p>
        </div>
        <div className="w-full text-sm text-center flex max-md:flex-col items-center justify-center gap-y-3 gap-x-10 mt-4 mb-8">
          <span className="px-8 py-3 bg-green-600 font-bold rounded-md uppercase">
            Max Strick: {data?.max_strick}
          </span>
          <span className="px-8 py-3 bg-green-500 font-bold rounded-md uppercase">
            Current Strick: {data?.strick}
          </span>
        </div>
        <div className="flex items-center justify-center overflow-x-auto overflow-y-hidden w-full">
          <div className="w-[200%] md:w-[80%] flex items-center justify-center flex-col">
            <CalendarHeatmap
              startDate={moment().startOf("year").toDate()}
              endDate={moment().endOf("year").toDate()}
              values={heatmapData}
              gutterSize={1}
              showWeekdayLabels
              classForValue={(value) => {
                if (!value) return "fill-gray-300";
                return value.count > 0 ? "fill-green-500" : "fill-gray-300";
              }}
              tooltipDataAttrs={(value) => ({
                "data-tip": value
                  ? `Date: ${value.date} | Count: ${value.count}`
                  : "No data",
              })}
            />
          </div>
        </div>
        {/* Snackbar */}
        {openSnackbar && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded shadow-lg z-50">
            Error fetching performance data
          </div>
        )}
      </div>
      <Footers />
    </div>
  );
};

export default PerformancePage;