'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../lib/firebase'; // Corrected relative path
import axios from 'axios';
import { toast } from 'react-toastify';

// GoogleSignUpButton component
const GoogleSignUpButton = ({ text, showToast }) => {
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      // Perform sign-in with Google using the Firebase SDK
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Safely get the email from the user's provider data
      const emailFromGoogle = user.providerData[0]?.email || user.email;

      if (!emailFromGoogle) {
        toast.error("Unable to retrieve email from Google.");
        return;
      }

      // Get the Firebase ID token for backend verification
      const token = await user.getIdToken();

      // Define the API endpoint within our Next.js app
      const postURL = `/api/auth/google`; 

      // Send the token and user info to our backend API route
      const res = await axios.post(postURL, {
        token,
        name: user.displayName,
        email: emailFromGoogle,
        googleProfileImage: user.photoURL,
        uid: user.uid,
      });

      // Handle the response from our backend
      if (res.data.success) {
        // Store user session info in sessionStorage
        sessionStorage.setItem('user', JSON.stringify(res.data.userData));
        sessionStorage.setItem('email', res.data.userData.email);
        sessionStorage.setItem('mName', res.data.userData.mName);
        sessionStorage.setItem('auth', 'true');
        sessionStorage.setItem('uid', res.data.userData.uid);
        sessionStorage.setItem('type', res.data.userData.type);
        
        toast.success(res.data.message);
        router.push('/home'); // Navigate to the home page on success
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      toast.error('An error occurred during Google Sign-In. Please try again.');
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      className="flex items-center justify-center w-full p-3 font-bold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      <img
        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTCWKGr_E3qM7B-B-_xwIZyF12n3sK3eM1q5w&s"
        alt="Google icon"
        className="w-6 h-6 mr-3 rounded-full"
      />
      {text}
    </button>
  );
};

export default GoogleSignUpButton;

