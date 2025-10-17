import React from "react";
import Header from "../../components/Header";
import Footers from "../../components/Footers";
import { IoIosTimer } from "react-icons/io";
import { BsSearch } from "react-icons/bs";
import { PiVideo } from "react-icons/pi";

const cardData = {
  features: [
    {
      id: 1,
      title: "Topic Input",
      description: "Easily enter topics and subtopics with an intuitive interface",
    },
    {
      id: 2,
      title: "Course Type Preferences",
      description: "Choose between Image + Theory or Video + Theory formats",
    },
    {
      id: 3,
      title: "AI-Powered Generation",
      description: "Our advanced AI algorithms analyze your inputs to generate comprehensive courses",
    },
    {
      id: 4,
      title: "Learning Styles",
      description: "Accommodate different learning styles to focus on images, videos, or textual content",
    },
    {
      id: 5,
      title: "Personalized Curriculum",
      description: "Receive a uniquely crafted curriculum based on your preferences",
    },
    {
      id: 6,
      title: "Real-time Preview",
      description: "See a real-time preview of your generated course before finalizing",
    },
  ],
  benefits: [
    {
      id: 1,
      title: "Time Efficiency",
      description: "Save hours of manual planning with instant course generation",
      icon: <IoIosTimer size={32} />,
    },
    {
      id: 2,
      title: "AI-Enhanced Materials",
      description: "Ensure high-quality content with AI-driven recommendations",
      icon: <BsSearch size={28} />,
    },
    {
      id: 3,
      title: "Interactive Learning",
      description: "Keeping users engaged with different of media formats",
      icon: <PiVideo size={32} />,
    },
  ],
  howItWorks: [
    {
      id: 1,
      title: "Enter Topics",
      description: "Begin the course creation journey by entering your desired topics",
    },
    {
      id: 2,
      title: "Choose Preferences",
      description: "Choose your preferred learning format",
    },
    {
      id: 3,
      title: "AI Magic",
      description: "Watch as our AI processes your inputs to generate a customized course",
    },
  ],
};

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div
    className={`bg-white dark:bg-gray-900/50 rounded-xl shadow-lg p-6 text-center transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${className}`}
  >
    {children}
  </div>
);

const FeaturesPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black">
      <Header isHome={false} />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Features Section */}
          <section className="py-20 text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 dark:text-white">
              Features
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Craft your courses Instantly with a powerful suite of tools
              designed for efficiency and personalization.
            </p>
            <div className="mt-16 grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {cardData.features.map((card) => (
                <Card key={card.id}>
                  <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {card.title}
                  </h5>
                  <p className="mt-2 font-normal text-gray-600 dark:text-gray-400">
                    {card.description}
                  </p>
                </Card>
              ))}
            </div>
          </section>

          {/* Benefits Section */}
          <section className="py-20 text-center rounded-2xl">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white">
              Benefits
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Unlock new levels of productivity and engagement.
            </p>
            <div className="mt-16 grid gap-8 grid-cols-1 md:grid-cols-3">
              {cardData.benefits.map((card) => (
                <Card key={card.id}>
                  <div className="mx-auto mb-4 flex items-center justify-center h-16 w-16 rounded-full bg-black text-white dark:bg-black dark:text-white">
                    {card.icon}
                  </div>
                  <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {card.title}
                  </h5>
                  <p className="mt-2 font-normal text-gray-600 dark:text-gray-400">
                    {card.description}
                  </p>
                </Card>
              ))}
            </div>
          </section>

          {/* How It Works Section */}
          <section className="py-20 text-center">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              A simple, three-step process to bring your course to life.
            </p>
            <div className="mt-24 flex flex-col md:flex-row justify-center items-center gap-12 md:gap-4 lg:gap-0">
              {cardData.howItWorks.map((card, index) => (
                <React.Fragment key={card.id}>
                  {/* Container for card and its number badge */}
                  <div className="relative w-64">
                    {/* Number Badge - Correctly positioned outside the Card */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center justify-center h-12 w-12 rounded-full bg-black dark:bg-black text-white font-bold text-xl border-4 border-white dark:border-gray-900">
                      {card.id}
                    </div>
                    <Card className="pt-10"> {/* Padding top to make space for the badge */}
                      <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                        {card.title}
                      </h5>
                      <p className="mt-2 font-normal text-gray-600 dark:text-gray-400">
                        {card.description}
                      </p>
                    </Card>
                  </div>

                  {/* Responsive Connector Line */}
                  {index < cardData.howItWorks.length - 1 && (
                    <div className="h-12 w-1 md:h-1 md:w-24 bg-gray-300 dark:bg-gray-700 md:mx-4"></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footers />
    </div>
  );
};

export default FeaturesPage;