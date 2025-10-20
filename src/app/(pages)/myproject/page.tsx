"use client";

import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getApps } from "firebase/app";
import Header from "../../components/Header";
import Footers from "../../components/Footers";
import axiosInstance from "../../../lib/axios";
import Image from "next/image";

interface Project {
  _id: string;
  title: string;
  description?: string;
  dateCreated: string;
  completed: boolean;
  github_url?: string;
  video_url?: string;
  approve?: "accepted" | "rejected" | "pending" | string;
  time?: string | number;
  firebaseUId?: string;
}

const MyProjectPage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showCompleteModal, setShowCompleteModal] = useState<string | null>(null);
  const [showGithubModal, setShowGithubModal] = useState<string | null>(null);
  const [githubUrl, setGithubUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [openDescription, setOpenDescription] = useState(false);
  const [projectDesc, setProjectDesc] = useState<string | null>(null);

  // Fetch user and projects
  useEffect(() => {
    async function initAuthAndProjects() {
      if (typeof window === "undefined") return;

      try {
        // If Firebase app exists, use auth listener
        if (getApps().length > 0) {
          const auth = getAuth();
          const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
              setUser(currentUser);
              await fetchProjects(currentUser.uid);
            } else {
              setUser(null);
              setProjects([]);
            }
          });
          // keep the unsubscribe so it can be cleaned up if effect re-runs
          return unsubscribe;
        }

        // No firebase app initialized: fallback to stored uid (if any)
        const storedUid = sessionStorage.getItem("uid");
        if (storedUid) {
          await fetchProjects(storedUid);
        } else {
          setUser(null);
          setProjects([]);
        }
      } catch (err) {
        console.warn("Firebase not initialized or error during init:", err);
        const storedUid = sessionStorage.getItem("uid");
        if (storedUid) {
          await fetchProjects(storedUid);
        }
      }
    }

    // call and optionally capture unsubscribe to cleanup
    let unsubscribeFn: (() => void) | undefined;
    initAuthAndProjects().then((maybeUnsubscribe) => {
      if (typeof maybeUnsubscribe === "function") unsubscribeFn = maybeUnsubscribe;
    });

    return () => {
      if (unsubscribeFn) unsubscribeFn();
    };
  }, []);

  const fetchProjects = async (uid: string) => {
    try {
      const response = await axiosInstance.get("/api/getmyprojects");
      const data: Project[] = (response as any).data?.data || [];
      const filtered = data.filter((p) => p.firebaseUId === uid);
      setProjects(filtered);
    } catch (error) {
      console.error("Error fetching projects:", error);
      setProjects([]);
    }
  };

  const handleMarkAsComplete = (projectId: string) => setShowCompleteModal(projectId);
  const handleSaveGithubUrl = (projectId: string) => {
    setGithubUrl("");
    setVideoUrl("");
    setShowGithubModal(projectId);
  };

  const showDesc = (desc?: string) => {
    setProjectDesc(desc ?? null);
    setOpenDescription(true);
  };

  const confirmCompleteProject = async (projectId: string | null) => {
    if (!projectId) return;
    try {
      await axiosInstance.post("/api/updateuserproject", {
        projectId,
        completed: true,
      });
      setProjects((prev) =>
        prev.map((p) => (p._id === projectId ? { ...p, completed: true } : p))
      );
      setShowCompleteModal(null);
    } catch (error) {
      console.error("Error marking project as complete:", error);
    }
  };

  const confirmSaveGithubUrl = async (projectId: string | null) => {
    if (!projectId) return;
    try {
      await axiosInstance.post("/api/updateuserproject", {
        projectId,
        github_url: githubUrl,
        video_url: videoUrl,
      });
      setProjects((prev) =>
        prev.map((p) =>
          p._id === projectId ? { ...p, github_url: githubUrl, video_url: videoUrl } : p
        )
      );
      setShowGithubModal(null);
    } catch (error) {
      console.error("Error saving project links:", error);
    }
  };

  const calculateTimeLeft = (dateCreated?: string, duration?: string | number) => {
    const weeks = parseInt(String(duration || "1"), 10) || 1;
    if (!dateCreated) return "Unknown";
    const created = new Date(dateCreated);
    const due = new Date(created.getTime() + weeks * 7 * 24 * 60 * 60 * 1000);
    const diff = due.getTime() - Date.now();
    if (diff <= 0) return "Time's up!";
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return `${days} day${days !== 1 ? "s" : ""} left`;
  };

  return (
    <div className="h-screen flex flex-col overflow-x-hidden">
      <Header isHome={true} className="sticky top-0 z-50" />

      <div className="dark:bg-black flex-1 dark:text-white p-4">
        <h2 className="text-lg font-bold mb-4 w-screen text-center">My Projects</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {projects.length > 0 ? (
            projects.map((project) => (
              <div
                key={project._id}
                className="bg-gray-200 dark:bg-gray-800 p-6 rounded-lg shadow-md transition hover:bg-gray-300 dark:hover:bg-gray-800/90 transform ease-in-out duration-300 relative"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">
                    {project.title}
                  </h3>
                  <span
                    className={`text-xs font-bold uppercase px-2 py-1 rounded-lg text-white ${
                      project.approve === "accepted"
                        ? "bg-green-500"
                        : project.approve === "rejected"
                        ? "bg-red-500"
                        : "bg-yellow-500"
                    }`}
                  >
                    {project.approve || "pending"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      Created on:{" "}
                      {project.dateCreated
                        ? new Date(project.dateCreated).toLocaleDateString()
                        : "-"}
                    </p>

                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-medium mr-1">Description:</span>
                      <button
                        onClick={() => showDesc(project.description)}
                        className="text-blue-500 hover:underline"
                      >
                        Show Description
                      </button>
                    </p>

                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-medium">Status:</span>{" "}
                      {project.completed ? "Completed" : "In Progress"}
                    </p>

                    <div className="mt-4 space-y-2">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-medium">GitHub:</span>{" "}
                        {project.github_url ? (
                          <a
                            href={project.github_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            View Repository
                          </a>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </p>

                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-medium">Video Presentation:</span>{" "}
                        {project.video_url ? (
                          <a
                            href={project.video_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            Watch Video
                          </a>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </p>
                    </div>
                  </span>

                  <span className="flex items-center justify-center">
                    <div className="relative rounded-full bg-gray-300 dark:bg-gray-700 h-20 w-20 flex flex-col items-center justify-center p-2 shadow-md border-2 border-gray-400 dark:border-gray-600">
                      {(() => {
                        const tl = calculateTimeLeft(project.dateCreated, project.time);
                        if (tl === "Time's up!") {
                          return (
                            <div className="text-red-500 text-center font-semibold">
                              <p className="text-sm">Time's</p>
                              <p className="text-sm">up!</p>
                            </div>
                          );
                        }
                        const days = tl.split(" ")[0];
                        return (
                          <>
                            <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                              {days}
                            </span>
                            <span className="text-[0.65rem] text-gray-600 dark:text-gray-300">
                              days left
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  </span>
                </div>

                <div className="flex space-x-4 mt-6 justify-center">
                  {!project.completed && (
                    <>
                      <button
                        onClick={() => handleMarkAsComplete(project._id)}
                        className="py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      >
                        Submit
                      </button>
                      <button
                        onClick={() => handleSaveGithubUrl(project._id)}
                        className="py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      >
                        {project.github_url ? "Edit Details" : "Add Details"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center flex flex-col items-center justify-center w-screen">
              <Image
                alt="img"
                src="/found.svg"
                width={380}
                height={260}
                className="max-w-sm h-3/6"
              />
              <p className="text-black font-black dark:text-white text-xl">
                Nothing Found
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Project Description Modal */}
      {openDescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-2xl w-full mx-4 relative">
            <button
              onClick={() => setOpenDescription(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
            >
              &times;
            </button>
            <h3 className="text-lg font-bold mb-4">Project Description</h3>
            <p>{projectDesc}</p>
          </div>
        </div>
      )}

      {/* Mark Complete Confirmation Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-300 dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm w-full mx-4">
            <h3 className="text-2xl text-center text-red-500 font-bold mb-4">
              Are you sure ?
            </h3>
            <p className="text-center text-gray-600 dark:text-gray-200 text-sm">
              After marking this project as complete, you won't be able to
              change it or push updates on GitHub repository. Are you sure you
              want to proceed?
            </p>
            <div className="flex justify-center space-x-4 mt-6">
              <button
                onClick={() => setShowCompleteModal(null)}
                className="py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmCompleteProject(showCompleteModal)}
                className="py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GitHub & Video Details Modal */}
      {showGithubModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-lg w-full">
            <h2 className="text-xl text-center font-semibold text-gray-800 dark:text-white mb-2">
              Enter Project Details
            </h2>

            <div className="w-full bg-gray-600/50 dark:bg-gray-300/50 h-[1px] mb-3" />

            <h3 className="text-gray-600 dark:text-gray-300 mb-2 font-semibold text-sm italic">
              Note:
            </h3>
            <p className="text-xs italic text-gray-600 dark:text-gray-300 mb-6">
              <span className="block">
                • Include a <strong>GitHub link</strong> to showcase your
                repository and help others explore your code.
              </span>
              <span className="block">
                • Provide a <strong>video presentation</strong> link for a
                visual overview of your project.
              </span>
              <span className="block">
                • Ensure your GitHub <strong>README</strong> is detailed (with
                setup steps, features, screenshots, and usage) for better
                understanding.
              </span>
            </p>

            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              GitHub Repository URL
            </label>
            <input
              type="url"
              placeholder="https://github.com/username/repo"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className="block w-full p-2 mb-4 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />

            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Presentation Video URL (Optional)
            </label>
            <input
              type="url"
              placeholder="https://youtube.com/..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="block w-full p-2 mb-6 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />

            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => confirmSaveGithubUrl(showGithubModal)}
                className="py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Save
              </button>
              <button
                onClick={() => setShowGithubModal(null)}
                className="py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Footers />
    </div>
  );
};

export default MyProjectPage;
