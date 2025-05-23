import React, { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { useLocation } from 'react-router-dom';




const VideoPlayer = () => {
  const location = useLocation();
  const { videoId } = location.state || {};
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);

  const API_KEY = ""; // Make sure this matches your backend
  const fileId = ""; // Your Google Drive file ID
  
  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setLoading(true);
        
        // Fetch the video with proper headers
        const response = await fetch(`http://localhost:5000/stream/${fileId}`, {
          headers: {
            'x-api-key': API_KEY
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to load video: ${response.status} ${response.statusText}`);
        }
        
        // Create a blob URL from the response
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        setLoading(false);
      } catch (err) {
        console.error("Video loading error:", err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchVideo();
    
    // Clean up blob URL on unmount
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [fileId]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-3xl mx-auto mt-10 p-6 bg-red-50 rounded-xl shadow-md">
        <div className="text-center text-red-600 font-medium">
          <p className="text-lg">{error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto mt-6">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gray-800 text-white">
          <h2 className="text-xl font-semibold">Protected Video</h2>
        </div>
        
        <div className="relative bg-black aspect-video">
          {videoUrl && (
            <video
              className="w-full h-full"
              controls
              autoPlay
              src={videoUrl}
            >
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;