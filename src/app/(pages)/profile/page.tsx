'use client';

import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import Footers from "../../components/Footers";
import axiosInstance from "../../../lib/axios";
import { toast } from "react-toastify";
import { AiOutlineKey, AiOutlineLock, AiOutlineFileImage, AiOutlineYoutube, AiOutlineLoading } from "react-icons/ai";

const ProfilePage: React.FC = () => {
    const [mName, setName] = useState<string>(sessionStorage.getItem("mName") || "");
    const [email, setEmail] = useState<string>(sessionStorage.getItem("email") || "");
    const [profileImg, setProfileImg] = useState<string>(
        "https://firebasestorage.googleapis.com/v0/b/ai-based-training-platfo-ca895.appspot.com/o/user.png?alt=media&token=cdde4ad1-26e7-4edb-9f7b-a3172fbada8d"
    );
    const [password, setPassword] = useState<string>("");
    const [processing, setProcessing] = useState<boolean>(false);

    // API Key states
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [showApiKeyForm, setShowApiKeyForm] = useState(false);
    const [showUnsplashApiKeyForm, setShowUnsplashApiKeyForm] = useState(false);
    const [showYoutubeApiKeyForm, setShowYoutubeApiKeyForm] = useState(false);

    const [newApiKey, setNewApiKey] = useState("");
    const [currentApiKey, setCurrentApiKey] = useState(sessionStorage.getItem("apiKey") || "");
    const [showCurrentApiKey, setShowCurrentApiKey] = useState(false);

    const [newUnsplashApiKey, setNewUnsplashApiKey] = useState("");
    const [currentUnsplashApiKey, setCurrentUnsplashApiKey] = useState(sessionStorage.getItem("currentUnsplashApiKey") || "");
    const [showCurrentUnsplashApiKey, setShowCurrentUnsplashApiKey] = useState(false);

    const [newYoutubeApiKey, setNewYoutubeApiKey] = useState("");
    const [currentYoutubeApiKey, setCurrentYoutubeApiKey] = useState(sessionStorage.getItem("currentYoutubeApiKey") || "");
    const [showCurrentYoutubeApiKey, setShowCurrentYoutubeApiKey] = useState(false);

    const showToast = (msg: string) => {
        setProcessing(false);
        toast(msg, {
            position: "bottom-center",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
    };

    useEffect(() => {
        const uid = sessionStorage.getItem("uid");
        setName(sessionStorage.getItem("mName") || "");
        setEmail(sessionStorage.getItem("email") || "");
        if (uid) {
            const fetchProfile = async () => {
                try {
                    const response = await axiosInstance.get(`/api/user/profile?uid=${uid}`);
                    const data = response.data as { success: boolean; userProfile: { profile: string } };
                    if (data.success) {
                        setProfileImg(data.userProfile.profile);
                    }
                } catch (error) {
                    console.error("Error fetching profile:", error);
                }
            };
            fetchProfile();
        }
    }, []);

    // Profile update
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setProcessing(true);
        const uid = sessionStorage.getItem("uid");
        try {
            const response = await axiosInstance.post(`/api/profile`, { email, mName, password, uid });
            const data = response.data as { success: boolean; message?: string };
            if (data.success) {
                showToast("Profile updated successfully");
                sessionStorage.setItem("email", email);
                sessionStorage.setItem("mName", mName);
                setPassword("");
            } else {
                showToast(data.message || "Error updating profile");
            }
        } catch (error) {
            showToast("An error occurred.");
        } finally {
            setProcessing(false);
        }
    };

    // Gemini API Key
    const handleSubmitApiKey = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!newApiKey) {
            showToast("Please enter the new API key");
            return;
        }
        setProcessing(true);
        const uid = sessionStorage.getItem("uid");
        try {
            const response = await axiosInstance.post(`/api/profile`, { email, mName, apiKey: newApiKey, uid });
            const data = response.data as { success: boolean; message?: string };
            if (data.success) {
                setCurrentApiKey(newApiKey);
                sessionStorage.setItem("apiKey", newApiKey);
                showToast(data.message || "API Key updated");
                setNewApiKey("");
                setShowApiKeyForm(false);
            } else {
                showToast(data.message || "Error updating API Key");
            }
        } catch (error) {
            showToast("Internal Server Error");
        } finally {
            setProcessing(false);
        }
    };

    // Unsplash API Key
    const handleSubmitUnsplashApiKey = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!newUnsplashApiKey) {
            showToast("Please enter the new Unsplash API key");
            return;
        }
        setProcessing(true);
        const uid = sessionStorage.getItem("uid");
        try {
            const response = await axiosInstance.post(`/api/profile`, { email, mName, unsplashApiKey: newUnsplashApiKey, uid });
            const data = response.data as { success: boolean; message?: string };
            if (data.success) {
                setCurrentUnsplashApiKey(newUnsplashApiKey);
                sessionStorage.setItem("currentUnsplashApiKey", newUnsplashApiKey);
                showToast(data.message || "Unsplash API Key updated");
                setNewUnsplashApiKey("");
                setShowUnsplashApiKeyForm(false);
            } else {
                showToast(data.message || "Error updating Unsplash API Key");
            }
        } catch (error) {
            showToast("Internal Server Error");
        } finally {
            setProcessing(false);
        }
    };

    // YouTube API Key
    const handleSubmitYoutubeApiKey = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!newYoutubeApiKey) {
            showToast("Please enter the new YouTube API key");
            return;
        }
        setProcessing(true);
        const uid = sessionStorage.getItem("uid");
        try {
            const response = await axiosInstance.post(`/api/profile`, { email, mName, youtubeApiKey: newYoutubeApiKey, uid });
            const data = response.data as { success: boolean; message?: string };
            if (data.success) {
                setCurrentYoutubeApiKey(newYoutubeApiKey);
                sessionStorage.setItem("currentYoutubeApiKey", newYoutubeApiKey);
                showToast(data.message || "YouTube API Key updated");
                setNewYoutubeApiKey("");
                setShowYoutubeApiKeyForm(false);
            } else {
                showToast(data.message || "Error updating YouTube API Key");
            }
        } catch (error) {
            showToast("Internal Server Error");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header isHome={true} />
            <main className="dark:bg-black flex-1 py-10">
                <div className="max-w-lg mx-auto p-4">
                    <h1 className="text-center font-black text-4xl text-black dark:text-white mb-8">Profile</h1>
                    <div className="bg-slate-500 dark:bg-slate-600 p-6 rounded-lg text-white flex items-center justify-center mb-8">
                        <img src={profileImg} alt="Profile" className="w-20 h-20 rounded-full object-cover"/>
                        <div className="ml-4">
                            <h2 className="text-2xl font-bold capitalize">{mName}</h2>
                            <p className="text-sm">{email}</p>
                        </div>
                    </div>
                    <div className="space-y-4 mt-8">
                        <button
                            onClick={() => {
                                setShowPasswordForm(true);
                                setShowApiKeyForm(false);
                                setShowUnsplashApiKeyForm(false);
                                setShowYoutubeApiKeyForm(false);
                            }}
                            className="w-full bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition duration-200 flex items-center justify-center py-2"
                        >
                            <AiOutlineLock className="mr-2" />
                            Change Password
                        </button>
                        <button
                            onClick={() => {
                                setShowApiKeyForm(true);
                                setShowPasswordForm(false);
                                setShowUnsplashApiKeyForm(false);
                                setShowYoutubeApiKeyForm(false);
                            }}
                            className="w-full bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition duration-200 flex items-center justify-center py-2"
                        >
                            <AiOutlineKey className="mr-2" />
                            Manage Gemini API Key
                        </button>
                        <button
                            onClick={() => {
                                setShowUnsplashApiKeyForm(true);
                                setShowPasswordForm(false);
                                setShowApiKeyForm(false);
                                setShowYoutubeApiKeyForm(false);
                            }}
                            className="w-full bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition duration-200 flex items-center justify-center py-2"
                        >
                            <AiOutlineFileImage className="mr-2" />
                            Manage Unsplash API Key
                        </button>
                        <button
                            onClick={() => {
                                setShowYoutubeApiKeyForm(true);
                                setShowPasswordForm(false);
                                setShowApiKeyForm(false);
                                setShowUnsplashApiKeyForm(false);
                            }}
                            className="w-full bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition duration-200 flex items-center justify-center py-2"
                        >
                            <AiOutlineYoutube className="mr-2" />
                            Manage YouTube API Key
                        </button>
                    </div>
                    {showPasswordForm && (
                        <form onSubmit={handleSubmit} className="mt-6 bg-blue-700 p-4 rounded-lg">
                            <label className="font-bold text-white mb-2 block" htmlFor="password1">New Password</label>
                            <input
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="focus:ring-blue-500 focus:border-blue-500 border border-blue-400 bg-blue-900 text-white rounded-lg block w-full p-2 mb-4"
                                id="password1"
                                type="password"
                                required
                            />
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-blue-600 text-white font-bold rounded-lg w-full py-2"
                            >
                                {processing ? <AiOutlineLoading className="h-6 w-6 animate-spin mx-auto" /> : "Submit"}
                            </button>
                        </form>
                    )}
                    {showApiKeyForm && (
                        <div className="mt-6 bg-blue-700 p-4 rounded-lg">
                            <p className="font-bold text-white mb-2">Current Gemini API Key:</p>
                            <div className="flex items-center mb-4">
                                <input
                                    type={showCurrentApiKey ? "text" : "password"}
                                    value={currentApiKey}
                                    readOnly
                                    className="focus:ring-blue-500 focus:border-blue-500 border border-blue-400 bg-blue-900 text-white rounded-lg block w-full p-2"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentApiKey(!showCurrentApiKey)}
                                    className="ml-2 text-blue-200 underline"
                                >
                                    {showCurrentApiKey ? "Hide" : "Show"}
                                </button>
                            </div>
                            <form onSubmit={handleSubmitApiKey}>
                                <label className="font-bold text-white mb-2 block" htmlFor="newApiKey">New Gemini API Key</label>
                                <input
                                    value={newApiKey}
                                    onChange={(e) => setNewApiKey(e.target.value)}
                                    className="focus:ring-blue-500 focus:border-blue-500 border border-blue-400 bg-blue-900 text-white rounded-lg block w-full p-2 mb-4"
                                    id="newApiKey"
                                    type="text"
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-blue-600 text-white font-bold rounded-lg w-full py-2"
                                >
                                    {processing ? <AiOutlineLoading className="h-6 w-6 animate-spin mx-auto" /> : "Submit New Key"}
                                </button>
                            </form>
                        </div>
                    )}
                    {showUnsplashApiKeyForm && (
                        <div className="mt-6 bg-blue-700 p-4 rounded-lg">
                            <p className="font-bold text-white mb-2">Current Unsplash API Key:</p>
                            <div className="flex items-center mb-4">
                                <input
                                    type={showCurrentUnsplashApiKey ? "text" : "password"}
                                    value={currentUnsplashApiKey}
                                    readOnly
                                    className="focus:ring-blue-500 focus:border-blue-500 border border-blue-400 bg-blue-900 text-white rounded-lg block w-full p-2"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentUnsplashApiKey(!showCurrentUnsplashApiKey)}
                                    className="ml-2 text-blue-200 underline"
                                >
                                    {showCurrentUnsplashApiKey ? "Hide" : "Show"}
                                </button>
                            </div>
                            <form onSubmit={handleSubmitUnsplashApiKey}>
                                <label className="font-bold text-white mb-2 block" htmlFor="newUnsplashApiKey">New Unsplash API Key</label>
                                <input
                                    value={newUnsplashApiKey}
                                    onChange={(e) => setNewUnsplashApiKey(e.target.value)}
                                    className="focus:ring-blue-500 focus:border-blue-500 border border-blue-400 bg-blue-900 text-white rounded-lg block w-full p-2 mb-4"
                                    id="newUnsplashApiKey"
                                    type="text"
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-blue-600 text-white font-bold rounded-lg w-full py-2"
                                >
                                    {processing ? <AiOutlineLoading className="h-6 w-6 animate-spin mx-auto" /> : "Submit New Key"}
                                </button>
                            </form>
                        </div>
                    )}
                    {showYoutubeApiKeyForm && (
                        <div className="mt-6 bg-blue-700 p-4 rounded-lg">
                            <p className="font-bold text-white mb-2">Current YouTube API Key:</p>
                            <div className="flex items-center mb-4">
                                <input
                                    type={showCurrentYoutubeApiKey ? "text" : "password"}
                                    value={currentYoutubeApiKey}
                                    readOnly
                                    className="focus:ring-blue-500 focus:border-blue-500 border border-blue-400 bg-blue-900 text-white rounded-lg block w-full p-2"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentYoutubeApiKey(!showCurrentYoutubeApiKey)}
                                    className="ml-2 text-blue-200 underline"
                                >
                                    {showCurrentYoutubeApiKey ? "Hide" : "Show"}
                                </button>
                            </div>
                            <form onSubmit={handleSubmitYoutubeApiKey}>
                                <label className="font-bold text-white mb-2 block" htmlFor="newYoutubeApiKey">New YouTube API Key</label>
                                <input
                                    value={newYoutubeApiKey}
                                    onChange={(e) => setNewYoutubeApiKey(e.target.value)}
                                    className="focus:ring-blue-500 focus:border-blue-500 border border-blue-400 bg-blue-900 text-white rounded-lg block w-full p-2 mb-4"
                                    id="newYoutubeApiKey"
                                    type="text"
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-blue-600 text-white font-bold rounded-lg w-full py-2"
                                >
                                    {processing ? <AiOutlineLoading className="h-6 w-6 animate-spin mx-auto" /> : "Submit New Key"}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </main>
            <Footers />
        </div>
    );
};

export default ProfilePage;