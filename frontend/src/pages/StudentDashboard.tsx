import React, { useState, useRef, useEffect, Suspense, lazy } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Settings } from 'lucide-react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';

// Lazy load components
const CourseCard = lazy(() => import('../components/CourseCard'));
const CourseDetails = lazy(() => import('../components/CourseDetails'));
const ProfileSettings = lazy(() => import('../components/ProfileSettings'));

// Optimized THREE.js configuration for better performance
const setupThreeJS = (mountElement: HTMLDivElement) => {
  const isMobile = window.innerWidth < 768;
  const particlesCount = isMobile ? 1000 : 2000; // Reduced particle count
  
  const scene = new THREE.Scene();
  
  const camera = new THREE.PerspectiveCamera(
    isMobile ? 85 : 75, 
    window.innerWidth / window.innerHeight, 
    0.1, 
    1000
  );
  camera.position.z = isMobile ? 6 : 5;
  
  const renderer = new THREE.WebGLRenderer({ 
    alpha: true, 
    antialias: !isMobile, 
    powerPreference: 'high-performance'
  });
  
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  
  mountElement.appendChild(renderer.domElement);
  
  const particlesGeometry = new THREE.BufferGeometry();
  const posArray = new Float32Array(particlesCount * 3);
  
  for (let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * (isMobile ? 12 : 15);
  }
  
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  
  const particlesMaterial = new THREE.PointsMaterial({
    size: isMobile ? 0.05 : 0.03,
    color: 0x7c3aed,
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending
  });
  
  const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particlesMesh);
  
  const ambientLight = new THREE.AmbientLight(0x7c3aed, 0.5);
  scene.add(ambientLight);
  
  let resizeTimeout: NodeJS.Timeout;
  const handleResize = () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }, 100);
  };
  
  window.addEventListener('resize', handleResize);
  
  let animationId: number;
  let lastTime = 0;
  const animate = (currentTime: number) => {
    if (currentTime - lastTime < 16.67) { // Cap at ~60fps
      animationId = requestAnimationFrame(animate);
      return;
    }
    lastTime = currentTime;
    
    particlesMesh.rotation.x += 0.0002;
    particlesMesh.rotation.y += 0.0002;
    
    renderer.render(scene, camera);
    animationId = requestAnimationFrame(animate);
  };

  animate(0);
  
  return () => {
    window.removeEventListener('resize', handleResize);
    cancelAnimationFrame(animationId);
    mountElement.removeChild(renderer.domElement);
    
    scene.remove(particlesMesh);
    particlesGeometry.dispose();
    particlesMaterial.dispose();
    renderer.dispose();
  };
};

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center p-4">
    <motion.div
      className="w-6 h-6 border-2 border-primary-400 rounded-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  </div>
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 }
  }
};

// First, let's add proper type definitions to avoid type errors
interface Course {
  id: number;
  title: string;
  description: string;
  duration: string;
  level: string;
  image?: string;
  // Add other fields as needed
}

interface Module {
  id: number;
  courseId: number;
  title: string;
  description: string;
  day: number;
  // Add other fields as needed
}

interface Material {
  id: number;
  moduleId: number;
  courseId: number;
  material: string;
  // Add other fields as needed
}

export const StudentDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const mountRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseModules, setCourseModules] = useState<Module[]>([]);
  const [modulesMaterials, setModulesMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch courses from backend
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/courses');
        if (!response.ok) throw new Error('Failed to fetch courses');
        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, []);
  
  // Fetch course modules when a course is selected
  useEffect(() => {
    if (selectedCourse) {
      const fetchCourseModules = async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/course-modules/${selectedCourse}`);
          if (!response.ok) throw new Error('Failed to fetch course modules');
          const data = await response.json();
          setCourseModules(data);
          
          // Fetch materials for all modules in this course
          const materialsResponse = await fetch(`http://localhost:5000/api/module-materials/${selectedCourse}`);
          if (!materialsResponse.ok) throw new Error('Failed to fetch module materials');
          const materialsData = await materialsResponse.json();
          setModulesMaterials(materialsData);
        } catch (error) {
          console.error('Error fetching course details:', error);
        }
      };
      
      fetchCourseModules();
    }
  }, [selectedCourse]);

  const handleProfileUpdate = async (userData: Partial<User>) => {
    try {
      // Update local state immediately for better UX
      if (user) {
        const updatedUser = { ...user, ...userData };
        // Update user in context (assuming setUser is available from useAuth)
        // If not available, you'll need to modify AuthContext to provide this
        localStorage.setItem('user', JSON.stringify(updatedUser));
        window.location.reload(); // Reload to reflect changes
      }
      setShowSettings(false);
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  // Prepare course data with modules and materials
  const course = selectedCourse ? {
    ...courses.find(c => c.id.toString() === selectedCourse),
    modules: courseModules.map(module => ({
      ...module,
      materials: modulesMaterials
        .filter(material => material.moduleId === module.id)
        .map(material => material.material || '')
    }))
  } : null;

  const [viewTransition, setViewTransition] = useState(false);
  
  const changeView = (newCourseId: string | null) => {
    setViewTransition(true);
    setTimeout(() => {
      setSelectedCourse(newCourseId);
      setViewTransition(false);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-dark-300">
      <nav className="bg-dark-200 border-b border-primary-800/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <motion.h1 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="text-2xl font-bold text-primary-400"
              >
                Sankalp Training Portal
              </motion.h1>
            </div>
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSettings(true)}
                className="btn-secondary rounded-lg px-4 py-2 flex items-center"
              >
                <Settings className="w-5 h-5 mr-2" />
                Settings
              </motion.button>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex items-center text-gray-400"
              >
                <User className="w-5 h-5 mr-2" />
                <span>{user?.name}</span>
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={logout}
                className="btn-secondary rounded-lg px-4 py-2 flex items-center"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Logout
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <Suspense fallback={<LoadingFallback />}>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              {showSettings ? (
                <motion.div variants={itemVariants} className="card p-6">
                  <ProfileSettings
                    user={user!}
                    onSave={handleProfileUpdate}
                    onClose={() => setShowSettings(false)}
                  />
                </motion.div>
              ) : course ? (
                <motion.div variants={itemVariants} className="card p-6">
                  <CourseDetails
                    course={course}
                    onBack={() => changeView(null)}
                    email={user?.email}
                    name={user?.name}
                  />
                </motion.div>
              ) : (
                <>
                  <motion.h2 
                    variants={itemVariants}
                    className="text-xl font-bold text-primary-400 mb-6"
                  >
                    Available Courses
                  </motion.h2>
                  {loading ? (
                    <LoadingFallback />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {courses.map((course, index) => (
                        <motion.div
                          key={course.id}
                          variants={itemVariants}
                          className="bg-dark-100 rounded-lg p-4 border border-primary-800/20"
                        >
                          <CourseCard
                            course={{
                              id: course.id,
                              title: course.title || '',
                              description: course.description || '',
                              duration: course.duration || '',
                              level: course.level || '',
                              image: course.image || ''
                            }}
                            onClick={() => changeView(course.id.toString())}
                          />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </Suspense>
        </AnimatePresence>
      </main>
    </div>
  );
};
