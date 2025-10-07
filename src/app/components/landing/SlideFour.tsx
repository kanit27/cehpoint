import React from "react";
import { FreeType, FreeCost, FreeTime, MonthType, MonthTime, MonthCost, YearType, YearCost, YearTime } from '../../../lib/constants';

const plans = [
    {
        type: FreeType, cost: FreeCost, time: FreeTime,
        features: [
            "Generate 5 Sub-Topics",
            "Create Unlimited Course",
            "Video & Theory Course",
            "Lifetime access",
            "Theory & Image Course"
        ]
    },
    {
        type: MonthType, cost: MonthCost, time: `/${MonthTime}`,
        features: [
            "Generate 10 Sub-Topics",
            "Create Unlimited Course",
            "Video & Theory Course",
            "1 Month Access",
            "Theory & Image Course"
        ]
    },
    {
        type: YearType, cost: YearCost, time: `/${YearTime}`,
        features: [
            "Generate 10 Sub-Topics",
            "Create Unlimited Course",
            "Video & Theory Course",
            "1 Year Access",
            "Theory & Image Course"
        ]
    }
];

const SlideFour: React.FC = () => (
    <div className="dark:bg-black py-14">
        <div className="px-11 items-start justify-start text-start">
            <div className="text-4xl max-md:text-2xl font-black dark:text-white">Pricing</div>
            <p className="py-3 font-medium max-md:text-xs dark:text-white">
                Choose the right plan for your education and future
            </p>
        </div>
        <div className="lg:flex py-10 gap-6">
            {plans.map((plan, idx) => (
                <div
                    key={idx}
                    className="flex flex-col items-center justify-center lg:w-1/3 max-md:pt-4 bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 mx-2"
                >
                    <div className="text-xl font-bold dark:text-white mb-2">{plan.type}</div>
                    <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 mb-1">
                        {plan.cost} <span className="text-base font-normal">{plan.time}</span>
                    </div>
                    <ul className="text-gray-700 dark:text-gray-200 text-sm mt-4 space-y-2">
                        {plan.features.map((feature, i) => (
                            <li key={i}>• {feature}</li>
                        ))}
                    </ul>
                    <button className="mt-6 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                        Choose Plan
                    </button>
                </div>
            ))}
        </div>
    </div>
);

export default SlideFour;