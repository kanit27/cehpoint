import React from 'react';
import Header from '../../components/Header';
import Footers from '../../components/Footers';
import { IoIosTimer } from "react-icons/io";
import { BsSearch } from "react-icons/bs";
import { PiVideo } from "react-icons/pi";

const cardData = {
    features: [
        { id: 1, title: 'Topic Input', description: 'Easily enter topics and subtopics with an intuitive interface' },
        { id: 2, title: 'Course Type Preferences', description: 'Choose between Image + Theory or Video + Theory formats' },
        // ... more features
    ],
    benefits: [
        { id: 1, title: 'Time Efficiency', description: 'Save hours of manual planning with instant course generation', icon: <IoIosTimer /> },
        { id: 2, title: 'AI-Enhanced Materials', description: 'Ensure high-quality content with AI-driven recommendations', icon: <BsSearch /> },
        // ... more benefits
    ],
    howItWorks: [
        { id: 1, title: 'Enter Topics', description: 'Begin the course creation journey by entering your desired topics' },
        { id: 2, title: 'Choose Preferences', description: 'Choose your preferred learning format' },
        // ... more steps
    ]
};

const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 m-4 w-72 flex flex-col items-center">
        {children}
    </div>
);

const FeaturesPage: React.FC = () => {
    return (
        <div className='min-h-screen flex flex-col'>
            <Header isHome={false} />
            <main className='dark:bg-black flex-1'>
                {/* Features Section */}
                <section className='flex-1 flex flex-col items-center justify-center py-14'>
                    <h1 className="text-6xl font-black max-md:text-3xl dark:text-white">Features</h1>
                    <p className="text-center text-black mt-6 max-w-2xl font-medium max-md:text-xs dark:text-white">
                        Craft your courses Instantly
                    </p>
                    <div className='mt-16 flex flex-wrap items-center justify-center'>
                        {cardData.features.map((card) => (
                            <Card key={card.id}>
                                <h5 className='text-xl font-black tracking-tight text-black dark:text-white'>
                                    {card.title}
                                </h5>
                                <p className='font-normal text-sm text-black dark:text-white'>{card.description}</p>
                            </Card>
                        ))}
                    </div>
                </section>
                {/* Benefits Section */}
                <section className='flex-1 flex flex-col items-center justify-center py-14'>
                    <h1 className="text-4xl font-black max-md:text-2xl dark:text-white">Benefits</h1>
                    <div className='mt-16 flex flex-wrap items-center justify-center'>
                        {cardData.benefits.map((card) => (
                            <Card key={card.id}>
                                <div className="text-xl max-md:text-lg dark:text-white">{card.icon}</div>
                                <h5 className='text-xl font-black tracking-tight text-black dark:text-white'>
                                    {card.title}
                                </h5>
                                <p className='font-normal text-sm text-black dark:text-white'>{card.description}</p>
                            </Card>
                        ))}
                    </div>
                </section>
                {/* How It Works Section */}
                 <section className='flex-1 flex flex-col items-center justify-center py-14'>
                    <h1 className="text-4xl font-black max-md:text-2xl dark:text-white">How It Works</h1>
                     <div className='my-16 flex flex-wrap items-center justify-center'>
                        {cardData.howItWorks.map((card) => (
                             <Card key={card.id}>
                                 <p className='text-black dark:text-white'>{card.id}</p>
                                 <h5 className='text-xl font-black tracking-tight text-black dark:text-white'>
                                     {card.title}
                                 </h5>
                                 <p className='font-normal text-sm text-black dark:text-white'>{card.description}</p>
                             </Card>
                        ))}
                     </div>
                 </section>
            </main>
            <Footers />
        </div>
    );
};

export default FeaturesPage;