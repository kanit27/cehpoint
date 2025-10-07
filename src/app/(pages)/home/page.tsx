// app/home/page.tsx
'use client'; // This directive is essential for components that use hooks like useEffect.

import React, { useEffect, useState } from 'react';
import Header from '../../components/Header';       // Assuming Header is in components/
import Footers from '../../components/Footers';      // Assuming Footers is in components/
import UserCourses from '../../components/Usercourses'; // Assuming UserCourses is in components/
import axiosInstance from "../../../lib/axios";         // Assuming axiosInstance is in lib/

const HomePage: React.FC = () => {
    // State to hold the user ID, ensuring it's only read on the client-side
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        // We access sessionStorage here, inside useEffect, to ensure this code only runs on the client.
        const id = sessionStorage.getItem('uid');
        setUserId(id);

        if (id) {
            const fetchUserCourses = async () => {
                try {
                    const postURL = `/api/courses?userId=${id}`;
                    const res = await axiosInstance.get(postURL);
                    // Store the number of courses created today
                    sessionStorage.setItem("coursesCreatedToday", res.data.length.toString());
                } catch (error) {
                    console.error("Failed to fetch user courses:", error);
                }
            };
            fetchUserCourses();
        }
    }, []); // Empty dependency array ensures this runs once after the component mounts

    return (
        <div className='h-screen flex flex-col'>
            <Header isHome={true} />
            <div className='dark:bg-black flex-1'>
                <div className='pb-10'>
                    {/* Only render UserCourses if the userId has been loaded from sessionStorage */}
                    {userId ? <UserCourses userId={userId} /> : <div>Loading courses...</div>}
                </div>
            </div>
            <Footers />
        </div>
    );
};

export default HomePage;