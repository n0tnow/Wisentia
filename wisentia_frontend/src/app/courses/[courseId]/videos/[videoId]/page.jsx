// app/courses/[courseId]/videos/[videoId]/page.jsx
'use client';

import { useParams } from 'next/navigation';
import VideoPage from '@/components/course/VideoPage';

export default function Page() {
  const params = useParams();
  
  // Debugging için
  console.log("Page.jsx params:", params);
  
  return <VideoPage params={params} />;
}