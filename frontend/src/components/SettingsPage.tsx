import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, User, Mail, Phone, Lock, Eye, EyeOff, Save, Shield } from 'lucide-react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';

// Optimized Three.js background
const useThreeBackground = (mountRef: React.RefObject<HTMLDivElement>) => {
  useEffect(() => {
    if (!mountRef.current) return;
    
    const isMobile = window.innerWidth < 768;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !isMobile });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);
    
    // Particle system
    const geometry = new THREE.BufferGeometry();
    const count = isMobile ? 500 : 1000;
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 10;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({ size: 0.02, color: 0x7c3aed, transparent: true, opacity: 0.6 });
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    
    camera.position.z = 5;
    
    const animate = () => {
      particles.rotation.x += 0.001;
      particles.rotation.y += 0.002;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();
    
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);
};

// Mock user data
const mockUser = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1 (555) 123-4567'
};

const SettingsPage: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Form states
  const [profile, setProfile] = useState(mockUser);
  const [security, setSecurity] = useState({ current: '', new: '', confirm: '' });
  
  useThreeBackground(mountRef);
  
  const showMessage = (msg: string, isSuccess = true) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };
  
  const handleSave = async (type: string) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (type === 'security' && security.new !== security.confirm) {
      showMessage('Passwords do not match!', false);
      setLoading(false);
      return;
    }
    
    showMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} updated successfully!`);
    if (type === 'security') setSecurity({ current: '', new: '', confirm: '' });
    setLoading(false);
  };
  
  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield }
  ];
  
  const InputField = ({ label, type = 'text', value, onChange, icon: Icon, showToggle, onToggleShow }: any) => (
    <div className="space-y-2">
      <label className="flex items-center text-sm font-medium text-gray-300">
        <Icon className="w-4 h-4 mr-2" />
        {label}
      </label>
      <div className="relative">
        <input
          type={showToggle ? (showToggle.show ? 'text' : 'password') : type}
          value={value}
          onChange={onChange}
          className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none transition-colors pr-12"
        />
        {showToggle && (
          <button
            type="button"
            onClick={onToggleShow}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-400"
          >
            {showToggle.show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <div ref={mountRef} className="absolute inset-0 z-0" />
      
      {/* Animated background effects */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute top-20 left-10 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl"
          animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl"
          animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity, delay: 2 }}
        />
      </div>
      
      {/* Header */}
      <nav className="bg-gray-900/60 backdrop-blur-lg border-b border-gray-800/50 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.history.back()}
                className="bg-gray-800/80 text-purple-300 border border-purple-600/30 rounded-lg px-3 py-2 flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </motion.button>
              <h1 className="text-xl sm:text-2xl font-bold text-purple-400">Settings</h1>
            </div>
            <div className="flex items-center bg-gray-800/60 px-3 py-2 rounded-lg">
              <User className="w-5 h-5 mr-2 text-purple-400" />
              <span className="text-sm text-gray-300">{profile.name}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-4 sm:p-6 relative z-10">
        {/* Success/Error Message */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mb-6 p-4 rounded-lg ${
                message.includes('successfully')
                  ? 'bg-green-500/20 border border-green-500/30 text-green-300'
                  : 'bg-red-500/20 border border-red-500/30 text-red-300'
              }`}
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-gray-900/60 backdrop-blur-lg rounded-2xl border border-gray-800/50 overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Sidebar */}
            <div className="lg:w-64 bg-gray-800/30 border-r border-gray-700/50 p-6">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <motion.button
                    key={tab.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'text-gray-300 hover:bg-gray-800/50'
                    }`}
                  >
                    <tab.icon className="w-5 h-5 mr-3" />
                    {tab.label}
                  </motion.button>
                ))}
              </nav>
            </div>
            
            {/* Content */}
            <div className="flex-1 p-6">
              <AnimatePresence mode="wait">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    <h2 className="text-2xl font-bold text-purple-400">Profile Information</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputField
                        label="Full Name"
                        value={profile.name}
                        onChange={(e: any) => setProfile({ ...profile, name: e.target.value })}
                        icon={User}
                      />
                      <InputField
                        label="Email Address"
                        type="email"
                        value={profile.email}
                        onChange={(e: any) => setProfile({ ...profile, email: e.target.value })}
                        icon={Mail}
                      />
                      <InputField
                        label="Phone Number"
                        type="tel"
                        value={profile.phone}
                        onChange={(e: any) => setProfile({ ...profile, phone: e.target.value })}
                        icon={Phone}
                      />
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSave('profile')}
                      disabled={loading}
                      className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg flex items-center disabled:opacity-50 transition-colors"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </motion.button>
                  </motion.div>
                )}
                
                {/* Security Tab */}
                {activeTab === 'security' && (
                  <motion.div
                    key="security"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    <h2 className="text-2xl font-bold text-purple-400">Security Settings</h2>
                    
                    <div className="space-y-4">
                      <InputField
                        label="Current Password"
                        value={security.current}
                        onChange={(e: any) => setSecurity({ ...security, current: e.target.value })}
                        icon={Lock}
                        showToggle={{ show: showPassword.current }}
                        onToggleShow={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                      />
                      <InputField
                        label="New Password"
                        value={security.new}
                        onChange={(e: any) => setSecurity({ ...security, new: e.target.value })}
                        icon={Lock}
                        showToggle={{ show: showPassword.new }}
                        onToggleShow={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                      />
                      <InputField
                        label="Confirm New Password"
                        value={security.confirm}
                        onChange={(e: any) => setSecurity({ ...security, confirm: e.target.value })}
                        icon={Lock}
                        showToggle={{ show: showPassword.confirm }}
                        onToggleShow={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                      />
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSave('security')}
                      disabled={loading}
                      className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg flex items-center disabled:opacity-50 transition-colors"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      {loading ? 'Updating...' : 'Update Password'}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;