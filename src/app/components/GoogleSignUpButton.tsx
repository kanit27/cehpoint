'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../lib/firebase';
import axios from 'axios';
import { toast } from 'react-toastify';

interface GoogleSignUpButtonProps {
  text: string;
  showToast?: boolean;
}

const GoogleSignUpButton: React.FC<GoogleSignUpButtonProps> = ({ text, showToast }) => {
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const emailFromGoogle = user.providerData[0]?.email || user.email;

      if (!emailFromGoogle) {
        toast.error("Unable to retrieve email from Google.");
        return;
      }

      const token = await user.getIdToken();

      const postURL = `/api/auth/google`;

      interface GoogleAuthResponse {
        success: boolean;
        message: string;
        userData?: {
          email?: string;
          mName?: string;
          uid?: string;
          type?: string;
          [key: string]: any;
        };
      }

      const res = await axios.post<GoogleAuthResponse>(postURL, {
        token,
        name: user.displayName,
        email: emailFromGoogle,
        googleProfileImage: user.photoURL,
        uid: user.uid,
      });

      const data = res.data;

      if (data?.success) {
        const userData = data.userData || {};

        sessionStorage.setItem('user', JSON.stringify(userData));
        if (userData.email) sessionStorage.setItem('email', userData.email);
        if (userData.mName) sessionStorage.setItem('mName', userData.mName);
        sessionStorage.setItem('auth', 'true');
        if (userData.uid) sessionStorage.setItem('uid', userData.uid);
        if (userData.type) sessionStorage.setItem('type', userData.type);

        toast.success(data.message);
        router.push('/home');
      } else {
        toast.error(data?.message || 'Authentication failed.');
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

