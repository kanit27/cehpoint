// lib/constants.ts

// Define a type for a single review object for better type safety
interface Review {
  data: string;
  username: string;
  profession: string;
  photo: string;
  rating: string; // The rating is a string in your original data
}

// BRAND
export const mainname: string = "Cehpoint";
export const subname: string = "E-Learning AI Solutions";
export const name: string = "Cehpoint E-Learning AI Solutions";
export const company: string = "Cehpoint E-Learning & Cybersecurity AI Solutions";
export const websiteURL: string = "/";
export const logo: string =
  "https://firebasestorage.googleapis.com/v0/b/ai-based-training-platfo-ca895.appspot.com/o/ai-technology.png?alt=media&token=6d27fd25-93e6-4b0e-b39e-3228e82668b6";

// TESTIMONIALS
export const reviews: Review[] = [
  {
    data: "As a teacher, I've always wanted to create high-quality courses, but the time it takes to gather all the content was overwhelming. With this app, I can now generate a course using relevant YouTube videos in no time. It's a game-changer!",
    username: "Ravi Kumar (Tech Educator)",
    profession: "Senior Educator at LearnTech Academy",
    photo:
      "https://ui-avatars.com/api/?name=Ravi+Kumar&background=4C9C4C&color=fff&size=128",
    rating: "5",
  },
  {
    data: "I was able to quickly create a comprehensive course on digital marketing using this AI-powered tool. It automatically curated YouTube videos and created an engaging curriculum. This is the future of online learning!",
    username: "Priya Sharma (Marketing Expert)",
    profession: "Digital Marketing Consultant",
    photo:
      "https://ui-avatars.com/api/?name=Priya+Sharma&background=FF5722&color=fff&size=128",
    rating: "4",
  },
  // ... other reviews
];

export const review: string =
  "The AI Course Generator revolutionized my content creation process, providing accurate and relevant topics effortlessly. It's a time-saving powerhouse that enhances the quality and relevance of my courses. A must-have tool for educators seeking efficiency and impactful online learning experiences.";
export const from: string = "Jit Banerjee (Officially Sujan Banerjee )";
export const profession: string = "Founder & CEO at Cehpoint";
export const photoURL: string =
  "https://play-lh.googleusercontent.com/sV_ffBmBJt_je4RZHnfaCfcnL-Hy6C14Iol7H5EMj9fzI2GDOonuojdn5t9p6n9IAX8j";

export const FreeType = "Free";
export const FreeCost = "₹0";
export const FreeTime = "Lifetime";

export const MonthType = "Monthly";
export const MonthCost = "₹299";
export const MonthTime = "month";

export const YearType = "Yearly";
export const YearCost = "₹1999";
export const YearTime = "year";