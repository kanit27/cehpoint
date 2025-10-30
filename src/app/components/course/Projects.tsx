// app/components/course/Projects.tsx
"use client";

import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { getApps } from "firebase/app";
import { AxiosError } from "axios";
import axiosInstance from "@/lib/axios";
import { toast } from "react-toastify";
import { AiOutlineLoading } from "react-icons/ai";

interface Project {
  _id?: string;
  title: string;
  description?: string;
  difficulty?: string;
  time?: string;
  timeEstimate?: string;
  completed?: boolean;
  firebaseUId?: string;
  userId?: string;
  // Fields from AI generation
  category?: string;
  learningObjectives?: string[];
  deliverables?: string[];
  technologies?: string[];
}

interface UserDoc {
  _id?: string;
  id?: string;
  uid?: string;
  email?: string;
  mName?: string;
  profile?: string;
}

interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  note?: string;
  count?: number;
  message?: string;
}

interface ProjectsProps {
  courseTitle: string;
  parentLoading?: boolean;
}

const safeParse = (s: string | null) => {
  try {
    return s ? JSON.parse(s) : {};
  } catch {
    return {};
  }
};

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
        setFirebaseUid(u?.uid ?? (typeof window !== "undefined" ? sessionStorage.getItem("uid") : null));
      } else {
        setFirebaseUser(null);
        setFirebaseUid(typeof window !== "undefined" ? sessionStorage.getItem("uid") : null);
      }
    } catch (err) {
      console.warn("Firebase not initialized:", err);
      setFirebaseUser(null);
      setFirebaseUid(typeof window !== "undefined" ? sessionStorage.getItem("uid") : null);
    }
  }, []);

  useEffect(() => {
    if (firebaseUser) {
      const emailFromGoogle = firebaseUser.providerData?.[0]?.email;
      setUserEmail(emailFromGoogle || firebaseUser.email || "");
    } else {
      if (typeof window !== "undefined") {
        setUserEmail(sessionStorage.getItem("email") || "");
      }
    }
  }, [firebaseUser]);

  // fetch user id by email (new /api/getusers?email=... endpoint)
  useEffect(() => {
    const fetchUserId = async () => {
      if (!userEmail) return;
      try {
        // request and cast to any to avoid narrow 'never' inference from .catch
        const resp = (await axiosInstance
          .get(`/api/getusers?email=${encodeURIComponent(userEmail)}`)
          .catch(() => null)) as any | null;

        // assert payload shape
        const payload = resp?.data as ApiResponse<UserDoc> | undefined;

        if (payload?.success && payload.data) {
          const user = payload.data;
          setUserId(user._id || user.id || user.uid || null);
          return;
        }

        // fallback: fetch all users and find by email
        const allResp = (await axiosInstance.get("/api/getusers").catch(() => null)) as any | null;
        const users = (allResp?.data?.data ?? allResp?.data) as UserDoc[] | undefined;
        const found = Array.isArray(users) ? users.find((u) => u.email === userEmail) ?? null : null;
        if (found) {
          setUserId(found._id || found.id || found.uid || null);
        } else {
          setUserId(null);
        }
      } catch (err) {
        console.error("fetchUserId error:", err);
      }
    };
    fetchUserId();
  }, [userEmail]);

  // fetch project suggestions
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const storedConfig = typeof window !== "undefined" ? safeParse(localStorage.getItem("projectConfig")) : {};
        const apiKey = typeof window !== "undefined" ? sessionStorage.getItem("apiKey") : null;
        const payload = {
          mainTopic: storedConfig?.mainTopic || courseTitle || "",
          useUserApiKey: Boolean(storedConfig?.useUserApiKey) || false,
          userApiKey: apiKey || null,
        };

        // Try AI generation first
        try {
          const aiResponse = await axiosInstance.post<ApiResponse<Project[]>>("/api/project-templates", payload);
          if (aiResponse.data?.success && aiResponse.data.data?.length > 0) {
            setProjectPages(aiResponse.data.data);
            return;
          }
        } catch (aiError) {
          console.debug("[Projects] AI generation failed, falling back to DB");
        }

        // Fallback to DB search
        const dbResponse = await axiosInstance.post<ApiResponse<Project[]>>("/api/project-suggestions", payload);
        if (dbResponse.data?.success) {
          setProjectPages(dbResponse.data.data ?? []);
          if (dbResponse.data.note) {
            setError(dbResponse.data.note);
          }
        }
      } catch (err) {
        const axiosError = err as AxiosError<ApiResponse>;
        console.error("Error fetching projects:", err);
        setError(
          axiosError.response?.data?.message || 
          axiosError.message || 
          "Failed to fetch projects"
        );
      } finally {
        setLoading(false);
      }
    };

    if (typeof window !== "undefined" && courseTitle) {
      fetchProjects();
    }
  }, [courseTitle]);

  useEffect(() => {
    const checkUserProjects = async () => {
      if (!userId && !firebaseUid) return;
      try {
        // Use GET /api/projects?uid=...
        const uid = firebaseUid || userId;
        const resp = await axiosInstance.get<ApiResponse<Project[]>>(`/api/projects?uid=${uid}`).catch(() => null);
        
        const userProjects = resp?.data?.data ?? [];
        
        // Filter just in case API returns more than needed (though query should handle it)
        const filtered = Array.isArray(userProjects)
          ? userProjects.filter(
              (p) => (firebaseUid && p.firebaseUId === firebaseUid) || (userId && (p.userId === userId || p.firebaseUId === userId))
            )
          : [];
        
        setCanCreateProject(filtered.length === 0 || filtered.every((p) => p.completed));
      } catch (err) {
        console.error("checkUserProjects error:", err);
      }
    };
    checkUserProjects();
  }, [userId, firebaseUid]);

  const updateProjectAssignedTo = async (projectTitle: string, uid: string) => {
    try {
      // This logic seems complex. Is /api/project-templates GET endpoint correct?
      // Assuming it's correct for now.
      const tplResp = await axiosInstance.get<ApiResponse<Project[]>>("/api/project-templates").catch(() => null);
      const templates = tplResp?.data?.data ?? [];
      const match = Array.isArray(templates) ? templates.find((t: any) => t.title === projectTitle || t.name === projectTitle) : null;
      if (match && (match as any)._id) {
        await axiosInstance.put(`/api/project-templates/${(match as any)._id}`, { userId: uid, title: projectTitle });
        return;
      }
      // Fallback: This endpoint seems deprecated or misnamed based on updateuserproject/route.ts
      // await axiosInstance.put("/api/updateuserproject", { projectTitle, userId: uid, title: projectTitle });
      console.warn("No matching project template found to update assignment.");
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

    try {
      const payload = {
        projectTitle: selectedProject.title,
        description: selectedProject.description || "",
        difficulty: selectedProject.difficulty || "Beginner",
        time: selectedProject.timeEstimate || selectedProject.time || "3-7 days",
        userId: userId || undefined,
        email: userEmail || "",
        completed: false,
        firebaseUId: firebaseUid || undefined,
      };

      await axiosInstance.post("/api/projects", payload);
      if (userId || firebaseUid) {
        await updateProjectAssignedTo(selectedProject.title, userId || firebaseUid || "");
      }
      toast.success("Project saved successfully");
      setCanCreateProject(false);
    } catch (err) {
      const axiosError = err as AxiosError<ApiResponse>;
      console.error("saveProject error:", err);
      toast.error(axiosError.response?.data?.message || "Failed to save project");
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
        <AiOutlineLoading className="h-8 w-8 animate-spin text-gray-900 dark:text-white" />
      </div>
    );
  }

  if (!canCreateProject && !loading && projectPages.length > 0) {
    return (
      <div className="bg-white dark:bg-black h-[60vh] scrollbar-none flex items-center justify-center overflow-hidden px-8 sm:px-28">
        <p className="text-red-500 mt-2 text-center text-xl">To create a new project, please complete your current projects first.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-black p-4 w-full max-w-4xl mx-auto">
      <h2 className="text-2xl text-gray-900 dark:text-white font-bold mb-4">Project Suggestions for {courseTitle}</h2>

      {projectPages.length === 0 ? (
        <div>
          <p className="text-gray-700 dark:text-gray-300">
            {error || "No project suggestions found."}
          </p>
          {error && <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">Note: {error}</p>}
        </div>
      ) : (
        <>
          <ul className="mb-4 w-full block space-y-3">
            {/* Display one project at a time */}
            {projectPages.slice(currentPage, currentPage + 1).map((project, index) => (
              <li
                key={project._id ?? project.title ?? index}
                className={`p-4 border rounded-lg w-full ${
                  selectedProject?.title === project.title 
                    ? "bg-green-100 dark:bg-green-900 border-green-400" 
                    : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                }`}
                onClick={() => handleProjectSelection(project)}
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{project.title}</h3>
                  {project.description && <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{project.description}</p>}
                  <div className="mt-2 text-sm text-gray-700 dark:text-gray-400">
                    <span className="mr-4 inline-block mb-1"><strong>Difficulty:</strong> {project.difficulty || "Beginner"}</span>
                    <span><strong>Time:</strong> {project.timeEstimate || project.time || "3-7 days"}</span>
                  </div>
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="mt-2 text-sm text-gray-700 dark:text-gray-400">
                      <strong>Technologies:</strong> {project.technologies.join(", ")}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <div className="flex justify-between items-center mt-4">
            <div className="flex gap-2">
              <button onClick={handlePrev} disabled={currentPage === 0} className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50">
                Prev
              </button>
              <button onClick={handleNext} disabled={currentPage >= projectPages.length - 1} className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50">
                Next
              </button>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400">{projectPages.length > 0 ? `Suggestion ${currentPage + 1} / ${projectPages.length}` : ""}</div>
          </div>

          {selectedProject && (
            <div className="mt-6 text-center">
              <button onClick={saveProject} className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg disabled:bg-gray-400" disabled={!canCreateProject}>
                Add to My Projects
              </button>
              {!canCreateProject && <p className="text-red-500 text-sm mt-2">You must complete your current project first.</p>}

              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
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

