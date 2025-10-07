// app/my-projects/page.tsx
'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import Footers from "../../components/Footers";
import axiosInstance from "../../../lib/axios";
import { toast } from "react-toastify";
import found from "../../assets/found.svg";
import Image from "next/image";

// Define an interface for the project for type safety
interface Project {
  _id: string;
  title: string;
  description: string;
  dateCreated: string;
  completed: boolean;
  github_url: string;
  video_url: string;
  approve: 'pending' | 'accepted' | 'rejected';
  time: string;
}

const MyProjectPage: React.FC = () => {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showCompleteModal, setShowCompleteModal] = useState<string | null>(null);
  const [showGithubModal, setShowGithubModal] = useState<string | null>(null);
  const [githubUrl, setGithubUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  useEffect(() => {
    const uid = sessionStorage.getItem('uid');
    if (!uid) {
      router.push('/signin');
      return;
    }

    const fetchProjects = async (firebaseUId: string) => {
      setLoading(true);
      try {
        // CORRECTED API CALL
        const response = await axiosInstance.get(`/api/projects?uid=${firebaseUId}`);
        setProjects(response.data);
      } catch (error) {
        console.error("Error fetching projects:", error);
        toast.error("Could not fetch your projects.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjects(uid);
  }, [router]);

  const handleUpdateProject = async (projectId: string, data: Partial<Project>) => {
    try {
      await axiosInstance.put(`/api/projects/${projectId}`, data);
      setProjects((prev) =>
        prev.map((p) => (p._id === projectId ? { ...p, ...data } : p))
      );
      toast.success("Project updated successfully!");
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error("Failed to update project.");
    }
  };

  const confirmCompleteProject = (projectId: string) => {
    handleUpdateProject(projectId, { completed: true });
    setShowCompleteModal(null);
  };

  const confirmSaveGithubUrl = (projectId: string) => {
    handleUpdateProject(projectId, { github_url: githubUrl, video_url: videoUrl });
    setShowGithubModal(null);
    setGithubUrl("");
    setVideoUrl("");
  };

  const calculateTimeLeft = (dateCreated: string, durationStr: string) => {
    const duration = parseInt(durationStr.match(/\d+/)?.[0] || '1');
    const createdDate = new Date(dateCreated);
    const dueDate = new Date(createdDate.getTime() + duration * 7 * 24 * 60 * 60 * 1000);
    const timeLeft = dueDate.getTime() - new Date().getTime();

    if (timeLeft <= 0) return "Time's up!";
    const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
    return `${daysLeft} day${daysLeft > 1 ? 's' : ''} left`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header isHome={true} />
      <main className="dark:bg-black flex-1 dark:text-white p-4">
        <h2 className="text-2xl font-bold mb-8 text-center">My Projects</h2>
        
        {loading ? (
            <div className="flex justify-center items-center h-64">Loading projects...</div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project._id} className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold">{project.title}</h3>
                    <span className={`text-xs font-bold uppercase px-2 py-1 rounded-full text-white ${project.approve === 'accepted' ? 'bg-green-500' : project.approve === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'}`}>{project.approve}</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Created: {new Date(project.dateCreated).toLocaleDateString()}</p>
                  <p className="mb-2">Status: <span className={project.completed ? 'text-green-500' : 'text-yellow-500'}>{project.completed ? "Completed" : "In Progress"}</span></p>
                  <p className="font-semibold">{calculateTimeLeft(project.dateCreated, project.time)}</p>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-700">
                  {!project.completed && (
                    <div className="flex justify-center space-x-4">
                      <button onClick={() => setShowCompleteModal(project._id)} className="py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600">Submit</button>
                      <button onClick={() => setShowGithubModal(project._id)} className="py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Add Details</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center flex flex-col items-center justify-center mt-10">
            <Image alt="Nothing found" src={found} className="max-w-xs" />
            <p className="font-black text-2xl mt-4">No Projects Found</p>
          </div>
        )}
      </main>
      
      {/* Modals remain the same */}

      <Footers />
    </div>
  );
};

export default MyProjectPage;