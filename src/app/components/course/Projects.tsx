// app/components/course/Projects.tsx
"use client";

import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { getApps } from "firebase/app";
import axiosInstance from "../../../lib/axios";
import { toast } from "react-toastify";
import { AiOutlineLoading } from "react-icons/ai";

interface Project {
  _id?: string;
  title: string;
  description?: string;
  difficulty?: string;
  time?: string;
  timeEstimate?: string;
}

interface ProjectsProps {
  courseTitle: string;
  parentLoading?: boolean;
}

const Projects: React.FC<ProjectsProps> = ({ courseTitle, parentLoading = false }) => {
  const [firebaseUser, setFirebaseUser] = useState<any | null>(null);
  const [firebaseUid, setFirebaseUid] = useState<string | null>(null);

  const [projectPages, setProjectPages] = useState<Project[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [canCreateProject, setCanCreateProject] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only call Firebase on client and only if initialized
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (getApps().length > 0) {
        const auth = getAuth();
        const u = auth.currentUser ?? null;
        setFirebaseUser(u);
        setFirebaseUid(u?.uid ?? sessionStorage.getItem("uid") ?? null);
      } else {
        setFirebaseUser(null);
        setFirebaseUid(sessionStorage.getItem("uid") ?? null);
      }
    } catch (err) {
      console.warn("Firebase not initialized:", err);
      setFirebaseUser(null);
      setFirebaseUid(sessionStorage.getItem("uid") ?? null);
    }
  }, []);

  useEffect(() => {
    if (firebaseUser) {
      const emailFromGoogle = firebaseUser.providerData?.[0]?.email;
      setUserEmail(emailFromGoogle || firebaseUser.email || "");
    } else {
      setUserEmail((typeof window !== "undefined" && sessionStorage.getItem("email")) || "");
    }
  }, [firebaseUser]);

  // fetch user id by email (try getusers then profile fallback)
  useEffect(() => {
    const fetchUserId = async () => {
      if (!userEmail) return;
      try {
        let resp = (await axiosInstance.get("/api/getusers").catch(() => null)) as any;
        if (!resp || !resp.data) {
          resp = (await axiosInstance.get("/api/user/profile").catch(() => null)) as any;
          if (resp && resp.data && resp.data.email === userEmail) {
            setUserId(resp.data._id || resp.data.id || null);
            return;
          }
        } else {
          const users = resp.data ?? [];
          const found = users.find((u: any) => u.email === userEmail);
          if (found) {
            setUserId(found._id || found.id || null);
            return;
          }
        }
      } catch (err) {
        console.error("fetchUserId error:", err);
      }
    };
    fetchUserId();
  }, [userEmail]);

  // fetch project suggestions (use /api/project-suggestions)
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const storedConfig = JSON.parse(localStorage.getItem("projectConfig") || "{}");
        const apiKey = sessionStorage.getItem("apiKey");
        const payload = {
          mainTopic: storedConfig.mainTopic || courseTitle || "",
          useUserApiKey: Boolean(storedConfig.useUserApiKey) || false,
          userApiKey: apiKey || null,
        };
        const response = (await axiosInstance.post("/api/project-suggestions", payload).catch((e) => { throw e; })) as any;
        const data = response?.data?.data ?? response?.data ?? [];
        setProjectPages(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error("Error fetching projects:", err);
        setError(err?.response?.data?.message || err?.message || "Failed to fetch projects");
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [courseTitle]);

  // determine if user can create new project
  useEffect(() => {
    const checkUserProjects = async () => {
      if (!userId && !firebaseUid) return;
      try {
        const resp = (await axiosInstance.get("/api/getmyprojects").catch(() => null)) as any;
        const userProjects = resp?.data?.data ?? resp?.data ?? [];
        const filtered = userProjects.filter(
          (p: any) => (firebaseUid && p.firebaseUId === firebaseUid) || (userId && p.userId === userId)
        );
        setCanCreateProject(filtered.length === 0 || filtered.every((p: any) => p.completed));
      } catch (err) {
        console.error("checkUserProjects error:", err);
      }
    };
    checkUserProjects();
  }, [userId, firebaseUid]);

  const updateProjectAssignedTo = async (projectTitle: string, uid: string) => {
    try {
      const tplResp = (await axiosInstance.get("/api/project-templates").catch(() => null)) as any;
      const templates = tplResp?.data?.data ?? tplResp?.data ?? [];
      const match = Array.isArray(templates) ? templates.find((t: any) => t.title === projectTitle || t.name === projectTitle) : null;
      if (match && match._id) {
        await axiosInstance.put(`/api/project-templates/${match._id}`, { userId: uid, title: projectTitle });
        return;
      }
      // fallback endpoint from repo
      await axiosInstance.put("/api/updateuserproject", { projectTitle, userId: uid, title: projectTitle });
    } catch (err) {
      console.error("updateProjectAssignedTo error:", err);
    }
  };

  const saveProject = async () => {
    if (!selectedProject) {
      toast.error("Please select a project.");
      return;
    }
    if (!canCreateProject) {
      toast.warn("Complete your current projects first.");
      return;
    }

    const payload = {
      projectTitle: selectedProject.title,
      description: selectedProject.description || "",
      difficulty: selectedProject.difficulty || "Beginner",
      time: selectedProject.timeEstimate || selectedProject.time || "3-7 days",
      userId: userId || undefined,
      email: userEmail || "",
      completed: false,
      github_url: "",
      video_url: "",
      firebaseUId: firebaseUid || undefined,
    };

    try {
      await axiosInstance.post("/api/projects", payload);
      await updateProjectAssignedTo(selectedProject.title, userId || firebaseUid || "");
      toast.success("Project saved successfully");
      setCanCreateProject(false);
    } catch (err) {
      console.error("saveProject error:", err);
      toast.error("Failed to save project.");
    }
  };

  const handleProjectSelection = (project: Project) => setSelectedProject(project);
  const handleNext = () => setCurrentPage((p) => Math.min(projectPages.length - 1, p + 1));
  const handlePrev = () => setCurrentPage((p) => Math.max(0, p - 1));

  // If parent shows a global/full-screen loader, don't show Projects spinner
  if (parentLoading) return null;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <AiOutlineLoading className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!canCreateProject && !loading) {
    return (
      <div className="bg-white dark:bg-black h-[60vh] scrollbar-none flex items-center justify-center overflow-hidden px-8 sm:px-28">
        <p className="text-red-500 mt-2 text-center text-xl">
          To create a new project, please complete your current projects first.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-black p-4 w-full max-w-4xl mx-auto">
      <h2 className="text-2xl text-gray-900 dark:text-white font-bold mb-4">
        Project Suggestions for {courseTitle}
      </h2>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {projectPages.length === 0 ? (
        <p className="text-gray-700 dark:text-gray-300">No project suggestions found.</p>
      ) : (
        <>
          <ul className="mb-4 w-full block space-y-3">
            {projectPages.map((project, index) => (
              <li
                key={project._id ?? project.title ?? index}
                className={`cursor-pointer p-3 border rounded-md w-full ${
                  selectedProject?.title === project.title ? "bg-green-100 dark:bg-green-900" : "bg-gray-50 dark:bg-gray-800"
                }`}
                onClick={() => handleProjectSelection(project)}
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{project.title}</h3>
                  {project.description && <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{project.description}</p>}
                  <div className="mt-2 text-sm text-gray-700 dark:text-gray-400">
                    <span className="mr-4">Difficulty: {project.difficulty || "Beginner"}</span>
                    <span>Time: {project.timeEstimate || project.time || "3-7 days"}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <button onClick={handlePrev} disabled={currentPage === 0} className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50">Prev</button>
              <button onClick={handleNext} disabled={currentPage === projectPages.length - 1} className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50">Next</button>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400">
              {projectPages.length > 0 ? `${currentPage + 1} / ${projectPages.length}` : ""}
            </div>
          </div>

          {selectedProject && (
            <div className="mt-6 text-center">
              <button onClick={saveProject} className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg disabled:bg-gray-400" disabled={!canCreateProject}>
                Add to My Projects
              </button>

              <div className="mt-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Selected Project</h3>
                <p className="mt-2 text-gray-700 dark:text-gray-300 text-lg">{selectedProject.title}</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Projects;