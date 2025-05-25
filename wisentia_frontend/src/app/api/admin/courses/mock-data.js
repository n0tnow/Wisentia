// src/app/api/admin/courses/mock-data.js
// This file contains mock data for courses when the backend is unavailable

export const MOCK_COURSES = [
  {
    id: 1,
    title: "React Fundamentals",
    description: "Learn the core concepts of React including components, props, state, and hooks. This course covers everything you need to build modern user interfaces with React.",
    category: "Programming",
    difficulty: "beginner",
    isActive: true,
    creationDate: "2023-11-15T10:00:00Z",
    enrolledUsers: 24,
    creator: "React Official",
    thumbnailUrl: "https://picsum.photos/id/20/800/400"
  },
  {
    id: 2, 
    title: "Advanced CSS Techniques",
    description: "Master advanced CSS concepts like Grid, Flexbox, animations, and CSS variables. Learn how to create responsive layouts and modern design effects.",
    category: "Design",
    difficulty: "intermediate",
    isActive: true,
    creationDate: "2023-10-22T14:30:00Z",
    enrolledUsers: 18,
    creator: "CSS Tricks",
    thumbnailUrl: "https://picsum.photos/id/21/800/400"
  },
  {
    id: 3,
    title: "Backend Development with Node.js",
    description: "Build scalable backends with Node.js and Express. Learn about RESTful APIs, authentication, database integration, and deployment strategies.",
    category: "Programming",
    difficulty: "advanced",
    isActive: true,
    creationDate: "2023-09-05T09:15:00Z",
    enrolledUsers: 32,
    creator: "Node.js Foundation",
    thumbnailUrl: "https://picsum.photos/id/22/800/400"
  },
  {
    id: 4,
    title: "UI/UX Design Principles",
    description: "Learn the fundamental principles of user interface and user experience design. Create intuitive and attractive designs that users will love.",
    category: "Design",
    difficulty: "beginner",
    isActive: true,
    creationDate: "2023-12-01T11:20:00Z",
    enrolledUsers: 45,
    creator: "Design Masters",
    thumbnailUrl: "https://picsum.photos/id/24/800/400"
  },
  {
    id: 5,
    title: "Full Stack JavaScript Development",
    description: "Become a full stack developer using JavaScript technologies like React, Node.js, and MongoDB. Build complete web applications from front to back.",
    category: "Programming",
    difficulty: "intermediate",
    isActive: true,
    creationDate: "2023-08-17T13:45:00Z",
    enrolledUsers: 29,
    creator: "JS Academy",
    thumbnailUrl: "https://picsum.photos/id/26/800/400"
  }
];

// Helper function to generate consistent mock response
export function generateMockCourseResponse(page = 1, pageSize = 20) {
  return {
    courses: MOCK_COURSES,
    totalCount: MOCK_COURSES.length,
    page: page,
    pageSize: pageSize,
    totalPages: Math.ceil(MOCK_COURSES.length / pageSize),
    isFallback: true
  };
} 