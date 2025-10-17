'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../lib/firebase';
import axios from 'axios';
import { toast } from 'react-toastify';

interface GoogleSignUpButtonProps {
  text: string;
  showToast?: (msg: string) => void;
}

interface UserData {
  uid?: string;
  email?: string;
  mName?: string;
  type?: string;
  [key: string]: any;
}

interface GoogleAuthResponse {
  success: boolean;
  message?: string;
  userData?: UserData;
}

const GoogleSignUpButton: React.FC<GoogleSignUpButtonProps> = ({ text, showToast }) => {
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const emailFromGoogle = user.providerData[0]?.email || user.email;
      if (!emailFromGoogle) {
        const msg = "Unable to retrieve email from Google.";
        showToast ? showToast(msg) : toast.error(msg);
        return;
      }

      const token = await user.getIdToken();
      const postURL = `/api/auth/google`;

      const res = await axios.post<GoogleAuthResponse>(postURL, {
        token,
        name: user.displayName,
        email: emailFromGoogle,
        googleProfileImage: user.photoURL,
        uid: user.uid,
      });

      if (res.data.success) {
        const successMsg = res.data.message || "Signed in successfully.";
        showToast ? showToast(successMsg) : toast.success(successMsg);

        sessionStorage.setItem('user', JSON.stringify(res.data.userData));
        sessionStorage.setItem('email', res.data.userData?.email || '');
        sessionStorage.setItem('mName', res.data.userData?.mName || '');
        sessionStorage.setItem('auth', 'true');
        sessionStorage.setItem('uid', res.data.userData?.uid || '');
        sessionStorage.setItem('type', res.data.userData?.type || '');

        router.push('/home');
      } else {
        const errMsg = res.data.message || "Google sign-in failed.";
        showToast ? showToast(errMsg) : toast.error(errMsg);
      }
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      const errMsg = 'An error occurred during Google Sign-In. Please try again.';
      showToast ? showToast(errMsg) : toast.error(errMsg);
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

