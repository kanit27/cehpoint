// app/(pages)/profile/page.tsx
'use client';

import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import Footers from "../../components/Footers";
import axiosInstance from "../../../lib/axios";
import { toast } from "react-toastify";
import { AiOutlineKey, AiOutlineLock } from "react-icons/ai";

const ProfilePage: React.FC = () => {
    const [mName, setName] = useState("");
    const [email, setEmail] = useState("");
    const [profileImg, setProfileImg] = useState("/user.png");
    const [password, setPassword] = useState("");
    const [processing, setProcessing] = useState(false);
    const [newApiKey, setNewApiKey] = useState("");

    useEffect(() => {
        const uid = sessionStorage.getItem("uid");
        setName(sessionStorage.getItem("mName") || "");
        setEmail(sessionStorage.getItem("email") || "");

        if (uid) {
            const fetchProfile = async () => {
                try {
                    const response = await axiosInstance.get(`/api/user/profile?uid=${uid}`);
                    if (response.data.success) {
                        setProfileImg(response.data.userProfile.profile);
                    }
                } catch (error) {
                    console.error("Error fetching profile:", error);
                }
            };
            fetchProfile();
        }
    }, []);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setProcessing(true);
        const uid = sessionStorage.getItem("uid");
        try {
            const response = await axiosInstance.post(`/api/profile`, { email, mName, password, uid });
            if (response.data.success) {
                toast.success("Profile updated successfully");
                sessionStorage.setItem("email", email);
                sessionStorage.setItem("mName", mName);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error("An error occurred.");
        } finally {
            setProcessing(false);
        }
    };
    
    // Add more handlers for API key updates...

    return (
        <div className="min-h-screen flex flex-col">
            <Header isHome={true} />
            <main className="dark:bg-black flex-1 py-10">
                <div className="max-w-lg mx-auto p-4">
                    <h1 className="text-center font-black text-4xl text-black dark:text-white mb-8">Profile</h1>
                    <div className="bg-gray-800 dark:bg-white/20 p-6 rounded-lg text-white flex items-center justify-center mb-8">
                        <img src={profileImg} alt="Profile" className="w-20 h-20 rounded-full object-cover"/>
                        <div className="ml-4">
                            <h2 className="text-2xl font-bold capitalize">{mName}</h2>
                            <p className="text-sm">{email}</p>
                        </div>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                         <div>
                            <label className="font-bold text-black dark:text-white">Name</label>
                            <input type="text" value={mName} onChange={(e) => setName(e.target.value)} className="w-full p-2 border rounded mt-1 dark:bg-gray-700 dark:border-gray-600"/>
                        </div>
                        <div>
                            <label className="font-bold text-black dark:text-white">Email</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 border rounded mt-1 dark:bg-gray-700 dark:border-gray-600"/>
                        </div>
                         <div>
                            <label className="font-bold text-black dark:text-white">New Password (optional)</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 border rounded mt-1 dark:bg-gray-700 dark:border-gray-600"/>
                        </div>
                        <button type="submit" disabled={processing} className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg">
                            {processing ? "Saving..." : "Save Changes"}
                        </button>
                    </form>
                </div>
            </main>
            <Footers />
        </div>
    );
};

export default ProfilePage;
