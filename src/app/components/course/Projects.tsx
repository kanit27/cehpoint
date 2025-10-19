// app/components/course/Projects.tsx
"use client";

import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../lib/axios';
import { toast } from 'react-toastify';
import { AiOutlineLoading } from 'react-icons/ai';

interface ProjectsProps {
  courseTitle: string;
}

interface ProjectSuggestion {
    _id: string; // From MongoDB
    title: string;
    description: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    timeEstimate: string;
}

const Projects: React.FC<ProjectsProps> = ({ courseTitle }) => {
    const [suggestions, setSuggestions] = useState<ProjectSuggestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProject, setSelectedProject] = useState<ProjectSuggestion | null>(null);
    const [canCreateProject, setCanCreateProject] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const uid = sessionStorage.getItem('uid');
        setUserId(uid);

        const checkUserProjects = async () => {
            if (!uid) return;
            try {
                const response = await axiosInstance.get(`/api/projects?uid=${uid}`);
                const userProjects = (response as any)?.data?.data || [];
                // Allow creation if user has no projects OR all their projects are marked as completed
                if (userProjects.length === 0 || userProjects.every((p: any) => p.completed)) {
                    setCanCreateProject(true);
                } else {
                    setCanCreateProject(false);
                }
            } catch (error) {
                console.error("Error checking user's existing projects:", error);
            }
        };

        const fetchSuggestions = async () => {
            setLoading(true);
            try {
                const response = await axiosInstance.post<{ success: boolean; data: ProjectSuggestion[] }>('/api/project-templates', { mainTopic: courseTitle });
                if (response?.data?.success) {
                    setSuggestions(response.data.data);
                }
            } catch (error) {
                toast.error("Could not fetch project suggestions.");
            } finally {
                setLoading(false);
            }
        };
        
        checkUserProjects();
        fetchSuggestions();
    }, [courseTitle]);

    const handleSaveProject = async () => {
        if (!selectedProject || !userId) {
            toast.error("Please select a project first.");
            return;
        }

        if (!canCreateProject) {
            toast.warn("You must complete your current projects before starting a new one.");
            return;
        }

        try {
            const projectData = {
                title: selectedProject.title,
                description: selectedProject.description,
                difficulty: selectedProject.difficulty,
                time: selectedProject.timeEstimate,
                userId: userId,
                firebaseUId: userId,
                email: sessionStorage.getItem('email') || '',
            };
            
            // Save the project to the user's list
            await axiosInstance.post('/api/projects', projectData);

            // Assign the user to the project template
            await axiosInstance.put(`/api/project-templates/${selectedProject._id}`, {
                userId: userId,
                title: selectedProject.title,
            });

            toast.success(`Project "${selectedProject.title}" has been added to your profile!`);
            setCanCreateProject(false); // Prevent adding another project immediately
        } catch (error) {
            toast.error("Failed to save the project.");
        }
    };
    
    if (loading) {
        return <div className="flex justify-center items-center h-64"><AiOutlineLoading className="h-12 w-12 animate-spin" /></div>;
    }

    if (!canCreateProject && !loading) {
        return (
            <div className="text-center p-8">
                <h3 className="text-xl font-semibold text-red-500">Action Required</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    You must complete your currently active projects before starting a new one.
                </p>
            </div>
        )
    }

    return (
        <div className="p-4 sm:p-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">Project Suggestions</h2>
            <div className="space-y-6">
                {suggestions.map((project, index) => (
                    <div key={project._id || index} className="border p-4 rounded-lg dark:border-gray-700">
                        <h3 className="text-xl font-semibold">{project.title}</h3>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">{project.description}</p>
                        <div className="mt-4 flex justify-between items-center text-sm">
                            <span className="font-medium">Difficulty: {project.difficulty}</span>
                            <span className="font-medium">Time: {project.timeEstimate}</span>
                        </div>
                        <button 
                            onClick={() => setSelectedProject(project)}
                            className={`w-full mt-4 px-4 py-2 rounded-lg ${selectedProject?._id === project._id ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-600'}`}
                        >
                            {selectedProject?._id === project._id ? 'Selected' : 'Select Project'}
                        </button>
                    </div>
                ))}
            </div>

            {selectedProject && (
                <div className="mt-8 text-center">
                    <button onClick={handleSaveProject} className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg disabled:bg-gray-400" disabled={!canCreateProject}>
                        Add to My Projects
                    </button>
                </div>
            )}
        </div>
    );
};

export default Projects;