// app/pages/About.tsx

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "flowbite-react";
import Header from "../../components/Header";
import Footers from "../../components/Footers";
import slide from "../../assets/about.svg";
import { company, name as appName } from "../../../lib/constants";

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header isHome={false} />
      <main className="dark:bg-black flex-1">
        <section className="flex-1 flex flex-col items-center justify-center px-3 py-14">
          <h1 className="text-6xl font-black max-md:text-3xl dark:text-white">
            About
          </h1>
          <p className="text-center text-black mt-6 max-w-2xl font-medium max-md:text-xs dark:text-white">
            Welcome to {appName}, the cutting-edge AI Course generator brought to you by {company}!
          </p>
        </section>

        <section className="px-7 max-md:px-3 justify-center items-center pb-10 dark:bg-black">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 h-full p-4 flex flex-col md:items-start justify-center">
              <h2 className="text-4xl font-black mb-2 max-md:text-2xl dark:text-white">
                About Us
              </h2>
              <p className="text-black mb-2 mt-2 max-md:text-center max-md:text-xs dark:text-white">
                At {company}, we believe in the transformative power of education and the endless possibilities that Artificial Intelligence unlocks...
              </p>
            </div>
            <div className="md:w-1/2 h-full">
              <Image src={slide} alt="About us illustration" className="w-full h-full object-cover" />
            </div>
          </div>
        </section>

        <section className="flex-1 flex flex-col items-center justify-center px-20 max-md:px-3 py-14">
          <h1 className="text-center text-4xl font-black max-md:text-2xl dark:text-white">
            Our Mission
          </h1>
          <p className="text-black mb-2 mt-8 text-center max-md:text-xs dark:text-white">
            Our mission is to empower college students and graduates with essential skills through project-based learning...
          </p>
        </section>

        <section className="flex-1 flex flex-col items-center justify-center px-20 max-md:px-3 py-14">
          <h1 className="text-center text-4xl font-black max-md:text-2xl dark:text-white">
            Join Us on the Learning Journey
          </h1>
          <p className="text-black mb-2 mt-8 text-center max-md:text-xs dark:text-white">
            We aim to provide a platform where students, graduates, and professionals can learn, build practical projects, and enhance their skills independently...
          </p>
          <Button as={Link} href="/contact" className="max-w-xs my-10 ...">
            Contact
          </Button>
        </section>
      </main>
      <Footers />
    </div>
  );
};

export default AboutPage;