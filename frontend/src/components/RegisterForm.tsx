import React, { useState, useRef, useEffect } from 'react';
import { UserPlus, ArrowLeft } from 'lucide-react';
import * as THREE from 'three';

interface RegisterFormProps {
  onLoginClick: () => void;
}

// Optimized THREE.js configuration for better performance
const setupThreeJS = (mountElement: HTMLDivElement) => {
  // Lower particle count for mobile devices
  const isMobile = window.innerWidth < 768;
  const particlesCount = isMobile ? 1500 : 3000;
  
  // Set up scene with optimized settings
  const scene = new THREE.Scene();
  
  // Set up camera with wider angle for better visibility on small screens
  const camera = new THREE.PerspectiveCamera(
    isMobile ? 85 : 75, 
    window.innerWidth / window.innerHeight, 
    0.1, 
    1000
  );
  camera.position.z = isMobile ? 6 : 5;
  
  // Set up renderer with lower pixel ratio for mobile
  const renderer = new THREE.WebGLRenderer({ 
    alpha: true, 
    antialias: !isMobile, 
    powerPreference: 'high-performance'
  });
  
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap pixel ratio for better performance
  
  mountElement.appendChild(renderer.domElement);
  
  // Create optimized particles
  const particlesGeometry = new THREE.BufferGeometry();
  const posArray = new Float32Array(particlesCount * 3);
  
  for (let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * (isMobile ? 12 : 15);
  }
  
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  
  // Use smaller particles on mobile for better performance
  const particlesMaterial = new THREE.PointsMaterial({
    size: isMobile ? 0.05 : 0.03,
    color: 0x7c3aed,
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending
  });
  
  const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particlesMesh);
  
  // Optimize lighting
  const ambientLight = new THREE.AmbientLight(0x7c3aed, 0.5);
  scene.add(ambientLight);
  
  // Handle resize efficiently with debounce
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
  
  // Use requestAnimationFrame for smooth animation
  let animationId: number;
  const animate = () => {
    // Slow down rotation for smoother look
    particlesMesh.rotation.x += 0.0003;
    particlesMesh.rotation.y += 0.0003;
    
    renderer.render(scene, camera);
    animationId = requestAnimationFrame(animate);
  };
  
  animate();
  
  // Return cleanup function
  return () => {
    window.removeEventListener('resize', handleResize);
    cancelAnimationFrame(animationId);
    mountElement.removeChild(renderer.domElement);
    
    // Dispose resources
    scene.remove(particlesMesh);
    particlesGeometry.dispose();
    particlesMaterial.dispose();
    renderer.dispose();
  };
};

export const RegisterForm: React.FC<RegisterFormProps> = ({ onLoginClick }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cleanup: () => void;
    
    if (mountRef.current) {
      cleanup = setupThreeJS(mountRef.current);
      
      // Set loaded state with a small delay to ensure smooth initial animations
      setTimeout(() => setIsLoaded(true), 100);
    }
    
    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate success
      setSuccess('Registration successful! Welcome to Sankalp Training Portal.');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
      });
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black overflow-hidden relative">
      {/* Custom CSS for animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeInTitle {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideInForm {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        
        .title-animation {
          opacity: 0;
          animation: fadeInTitle 0.6s ease-out forwards;
        }
        
        .subtitle-animation {
          opacity: 0;
          animation: fadeInTitle 0.6s ease-out 0.2s forwards;
        }
        
        .form-animation {
          opacity: 0;
          animation: slideInForm 0.8s ease-out 0.4s forwards;
        }
        
        .back-btn-animation {
          opacity: 0;
          animation: fadeIn 0.6s ease-out 0.3s forwards;
        }
        
        /* Button hover effects */
        .btn-hover {
          transition: all 0.3s ease;
        }
        
        .btn-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(124, 58, 237, 0.3);
        }
        
        .btn-hover:active {
          transform: translateY(0);
        }
        
        /* Input focus effects */
        .input-field {
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .input-field:focus {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgb(124, 58, 237);
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
          transform: translateY(-1px);
        }
        
        /* Glassmorphism form */
        .glass-form {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
        }
        
        /* Status message animations */
        .status-enter {
          animation: fadeIn 0.4s ease-out forwards;
        }
        
        /* Loading spinner */
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .spinner {
          animation: spin 1s linear infinite;
        }
      `}</style>
      
      {/* 3D Background container */}
      <div ref={mountRef} className="absolute inset-0 z-0" style={{ pointerEvents: 'none' }} />
      
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center justify-center min-h-screen">
        {/* Back Button */}
        <div className={`w-full max-w-md mb-4 ${isLoaded ? 'back-btn-animation' : 'opacity-0'}`}>
          <button
            type="button"
            onClick={onLoginClick}
            className="flex items-center text-purple-300 hover:text-white transition-colors duration-300 group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Back to Login
          </button>
        </div>

        {/* Title Section */}
        <div className={`text-center mb-8 ${isLoaded ? 'title-animation' : 'opacity-0'}`}>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="text-purple-400">Join</span> <span className="text-white">Sankalp</span>
          </h1>
          <p className={`text-lg text-gray-300 ${isLoaded ? 'subtitle-animation' : 'opacity-0'}`}>
            Start your journey in sign language learning
          </p>
        </div>

        {/* Registration Form */}
        <div className={`w-full max-w-md ${isLoaded ? 'form-animation' : 'opacity-0'}`}>
          <div className="glass-form rounded-2xl px-8 pt-8 pb-8">
            {/* Header with Icon */}
            <div className="flex items-center justify-center mb-8">
              <div className="p-3 bg-purple-600/20 rounded-full backdrop-blur-sm border border-purple-500/30">
                <UserPlus className="w-8 h-8 text-purple-400" />
              </div>
            </div>

            {/* Status Messages */}
            {error && (
              <div className="mb-6 status-enter">
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg backdrop-blur-sm">
                  {error}
                </div>
              </div>
            )}
            
            {success && (
              <div className="mb-6 status-enter">
                <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg backdrop-blur-sm">
                  {success}
                </div>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-6">
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2" htmlFor="name">
                  Full Name
                </label>
                <input
                  className="input-field w-full py-3 px-4 text-white placeholder-gray-400 rounded-lg focus:outline-none"
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2" htmlFor="email">
                  Email Address
                </label>
                <input
                  className="input-field w-full py-3 px-4 text-white placeholder-gray-400 rounded-lg focus:outline-none"
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2" htmlFor="phone">
                  Phone Number
                </label>
                <input
                  className="input-field w-full py-3 px-4 text-white placeholder-gray-400 rounded-lg focus:outline-none"
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2" htmlFor="password">
                  Password
                </label>
                <input
                  className="input-field w-full py-3 px-4 text-white placeholder-gray-400 rounded-lg focus:outline-none"
                  id="password"
                  type="password"
                  placeholder="Create a secure password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8">
              <button
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-3 px-6 rounded-lg btn-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                type="button"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full spinner mr-3"></div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5 mr-2" />
                    Create Account
                  </>
                )}
              </button>
            </div>

            {/* Footer Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={onLoginClick}
                  className="text-purple-400 hover:text-purple-300 font-semibold transition-colors duration-300"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};