import React, { useState, useRef, useEffect, Suspense, lazy } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Settings, Code, Zap } from 'lucide-react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';

const CourseCard = lazy(() => import('../components/CourseCard'));
const CourseDetails = lazy(() => import('../components/CourseDetails'));
const ProfileSettings = lazy(() => import('../components/ProfileSettings'));

// Optimized Three.js setup
const setupThreeJS = (mountElement: HTMLDivElement) => {
  const isMobile = window.innerWidth < 768;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;
  
  const renderer = new THREE.WebGLRenderer({ 
    alpha: true, 
    antialias: !isMobile,
    powerPreference: isMobile ? 'low-power' : 'high-performance'
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  mountElement.appendChild(renderer.domElement);
  
  // Single optimized particle system
  const particlesGeometry = new THREE.BufferGeometry();
  const particlesCount = isMobile ? 800 : 1500;
  const posArray = new Float32Array(particlesCount * 3);
  
  for (let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * (isMobile ? 12 : 15);
  }
  
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  
  const particlesMaterial = new THREE.PointsMaterial({
    size: isMobile ? 0.04 : 0.03,
    color: 0x7c3aed,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
  });
  
  const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particlesMesh);
  
  const ambientLight = new THREE.AmbientLight(0x7c3aed, 0.4);
  scene.add(ambientLight);
  
  let resizeTimeout: NodeJS.Timeout;
  const handleResize = () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }, 150);
  };
  
  window.addEventListener('resize', handleResize);
  
  const clock = new THREE.Clock();
  let animationId: number;
  let lastTime = 0;
  
  const animate = (currentTime: number) => {
    if (currentTime - lastTime < 33) { // Cap at 30fps for better performance
      animationId = requestAnimationFrame(animate);
      return;
    }
    lastTime = currentTime;
    
    const elapsed = clock.getElapsedTime();
    particlesMesh.rotation.x += 0.0003;
    particlesMesh.rotation.y += 0.0004;
    particlesMesh.position.x = Math.sin(elapsed * 0.2) * 0.3;
    particlesMesh.position.y = Math.cos(elapsed * 0.15) * 0.3;
    
    renderer.render(scene, camera);
    animationId = requestAnimationFrame(animate);
  };
  
  animate(0);
  
  return () => {
    window.removeEventListener('resize', handleResize);
    clearTimeout(resizeTimeout);
    cancelAnimationFrame(animationId);
    mountElement.contains(renderer.domElement) && mountElement.removeChild(renderer.domElement);
    scene.remove(particlesMesh);
    particlesGeometry.dispose();
    particlesMaterial.dispose();
    renderer.dispose();
  };
};

const LoadingFallback = () => (
  <div className="flex items-center justify-center p-8">
    <motion.div
      className="w-8 h-8 border-2 border-primary-400/30 border-t-primary-400 rounded-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  </div>
);

const animations = {
  container: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
  },
  item: {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 12 } }
  }
};

interface Course {
  id: number;
  title: string;
  description: string;
  duration: string;
  level: string;
  image?: string;
}

interface Module {
  id: number;
  courseId: number;
  title: string;
  description: string;
  day: number;
}

interface Material {
  id: number;
  moduleId: number;
  courseId: number;
  material: string;
}

export const StudentDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const mountRef = useRef<HTMLDivElement>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseModules, setCourseModules] = useState<Module[]>([]);
  const [modulesMaterials, setModulesMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (mountRef.current) {
      return setupThreeJS(mountRef.current);
    }
  }, []);
  
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
  
  useEffect(() => {
    if (selectedCourse) {
      const fetchCourseData = async () => {
        try {
          const [modulesRes, materialsRes] = await Promise.all([
            fetch(`http://localhost:5000/api/course-modules/${selectedCourse}`),
            fetch(`http://localhost:5000/api/module-materials/${selectedCourse}`)
          ]);
          
          if (modulesRes.ok && materialsRes.ok) {
            setCourseModules(await modulesRes.json());
            setModulesMaterials(await materialsRes.json());
          }
        } catch (error) {
          console.error('Error fetching course details:', error);
        }
      };
      fetchCourseData();
    }
  }, [selectedCourse]);

  const handleProfileUpdate = async (userData: Partial<User>) => {
    try {
      if (user) {
        const updatedUser = { ...user, ...userData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        window.location.reload();
      }
      setShowSettings(false);
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const course = selectedCourse ? {
    ...courses.find(c => c.id.toString() === selectedCourse),
    modules: courseModules.map(module => ({
      ...module,
      materials: modulesMaterials
        .filter(material => material.moduleId === module.id)
        .map(material => material.material || '')
    }))
  } : null;

  const changeView = (newCourseId: string | null) => {
    setSelectedCourse(newCourseId);
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <div ref={mountRef} className="absolute inset-0 z-0" style={{ pointerEvents: 'none' }} />
      
      {/* Optimized glow effects */}
      <motion.div
        className="absolute top-20 left-10 w-32 h-32 sm:w-48 sm:h-48 bg-primary-500/10 rounded-full blur-3xl"
        animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
        transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-40 h-40 sm:w-64 sm:h-64 bg-indigo-600/10 rounded-full blur-3xl"
        animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
        transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", delay: 2 }}
      />
      
      <nav className="bg-dark-300/60 backdrop-blur-lg border-b border-primary-800/20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.h1 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-lg sm:text-2xl font-bold text-primary-400 font-display"
            >
              Sankalp Training Portal
            </motion.h1>
            
            {/* Mobile-optimized nav items */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSettings(true)}
                className="bg-dark-400/80 backdrop-blur-md text-primary-300 border border-primary-600/30 rounded-lg px-2 py-1 sm:px-4 sm:py-2 flex items-center text-sm sm:text-base"
              >
                <Settings className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
                <span className="hidden sm:inline">Settings</span>
              </motion.button>
              
              <div className="hidden sm:flex items-center text-gray-300 bg-dark-400/60 backdrop-blur-md px-3 py-2 rounded-lg border border-primary-800/30">
                <User className="w-5 h-5 mr-2 text-primary-400" />
                <span className="text-sm">{user?.name}</span>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={logout}
                className="bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg px-2 py-1 sm:px-4 sm:py-2 flex items-center text-sm sm:text-base"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8 relative z-10">
        <AnimatePresence mode="wait">
          <Suspense fallback={<LoadingFallback />}>
            <motion.div
              variants={animations.container}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              {showSettings ? (
                <motion.div 
                  variants={animations.item} 
                  className="bg-dark-300/60 backdrop-blur-lg rounded-2xl shadow-2xl p-4 sm:p-6 border border-dark-400/50"
                >
                  <ProfileSettings
                    user={user!}
                    onSave={handleProfileUpdate}
                    onClose={() => setShowSettings(false)}
                  />
                </motion.div>
              ) : course ? (
                <motion.div 
                  variants={animations.item} 
                  className="bg-dark-300/60 backdrop-blur-lg rounded-2xl shadow-2xl p-4 sm:p-6 border border-dark-400/50"
                >
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
                    variants={animations.item}
                    className="text-xl sm:text-3xl font-bold text-primary-400 mb-6 sm:mb-8 font-display"
                  >
                    Available Courses
                  </motion.h2>
                  
                  {loading ? (
                    <LoadingFallback />
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {courses.map((course, index) => (
                        <motion.div
                          key={course.id}
                          variants={animations.item}
                          className="bg-dark-300/60 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-primary-800/20 hover:border-primary-500/50 transition-all duration-300 relative group"
                          whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(124, 58, 237, 0.3)" }}
                        >
                          {/* Mobile-optimized floating badge */}
                          <div className="absolute top-2 right-2 bg-dark-500/70 backdrop-blur-md px-2 py-1 rounded-full text-xs text-primary-300 border border-primary-500/30 flex items-center">
                            <Zap size={8} className="mr-1" />
                            {course.level}
                          </div>
                          
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