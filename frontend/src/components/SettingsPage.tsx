import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, User, Mail, Phone, Lock, Eye, EyeOff, Save, Shield, UserCircle } from 'lucide-react';
import * as THREE from 'three';

// Optimized Three.js background
const useThreeBackground = (mountRef) => {
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
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);
};

// Custom hook to get user data from various sources
const useUserData = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Method 1: Check for user data in component props or context
        // This would typically come from a React Context or props
        const contextUser = window.currentUser || null;
        
        // Method 2: Check localStorage for user session
        const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
        
        // Method 3: Check sessionStorage
        const sessionUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
        
        // Method 4: Make API call to get current user
        let apiUser = null;
        try {
          // Simulate API call - replace with your actual endpoint
          const response = await fetch('/api/user/me', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('authToken')}`
            }
          });
          if (response.ok) {
            apiUser = await response.json();
          }
        } catch (apiError) {
          console.log('API call failed, using alternative methods');
        }

        // Priority: API > Context > SessionStorage > LocalStorage > Default
        const user = apiUser || contextUser || sessionUser || storedUser || {
          name: 'Guest User',
          email: 'guest@example.com',
          phone: '',
          id: 'guest'
        };

        setUserData(user);
      } catch (err) {
        setError('Failed to load user data');
        // Fallback to guest user
        setUserData({
          name: 'Guest User',
          email: 'guest@example.com',
          phone: '',
          id: 'guest'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return { userData, loading, error };
};

const SettingsPage = ({ onNavigate }) => {
  const mountRef = useRef(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  // Get user data
  const { userData, loading: userLoading, error: userError } = useUserData();
  
  // Form states
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [security, setSecurity] = useState({ current: '', new: '', confirm: '' });
  
  useThreeBackground(mountRef);
  
  // Navigation handler
  const handleBackToDashboard = () => {
    // Try multiple navigation methods for maximum compatibility
    if (onNavigate) {
      // If parent component provides navigation function
      onNavigate('/dashboard');
    } else if (window.history.length > 1) {
      // Try to go back if there's history
      window.history.back();
    } else {
      // Fallback to dashboard route
      window.location.href = '/dashboard';
    }
  };
  
  useThreeBackground(mountRef);
  
  // Update profile state when userData changes
  useEffect(() => {
    if (userData) {
      setProfile({
        name: userData.name || userData.fullName || userData.displayName || '',
        email: userData.email || '',
        phone: userData.phone || userData.phoneNumber || ''
      });
    }
  }, [userData]);
  
  const showMessage = (msg, isSuccess = true) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };
  
  const handleSave = async (type) => {
    setSaving(true);
    
    try {
      if (type === 'profile') {
        // API call to update profile
        const response = await fetch('/api/user/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('authToken')}`
          },
          body: JSON.stringify(profile)
        });
        
        if (response.ok) {
          // Update stored user data
          const updatedUser = { ...userData, ...profile };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          showMessage('Profile updated successfully!');
        } else {
          throw new Error('Failed to update profile');
        }
      } else if (type === 'security') {
        if (security.new !== security.confirm) {
          showMessage('Passwords do not match!', false);
          setSaving(false);
          return;
        }
        
        // API call to update password
        const response = await fetch('/api/user/password', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('authToken')}`
          },
          body: JSON.stringify({
            currentPassword: security.current,
            newPassword: security.new
          })
        });
        
        if (response.ok) {
          setSecurity({ current: '', new: '', confirm: '' });
          showMessage('Password updated successfully!');
        } else {
          const error = await response.json();
          throw new Error(error.message || 'Failed to update password');
        }
      }
    } catch (error) {
      showMessage(error.message || `Failed to update ${type}`, false);
    } finally {
      setSaving(false);
    }
  };
  
  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield }
  ];
  
  const InputField = ({ label, type = 'text', value, onChange, icon: Icon, showToggle, onToggleShow, placeholder }) => (
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
          placeholder={placeholder}
          className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none transition-colors pr-12 placeholder-gray-500"
        />
        {showToggle && (
          <button
            type="button"
            onClick={onToggleShow}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-400 transition-colors"
          >
            {showToggle.show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
    </div>
  );

  if (userLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (userError) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <UserCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-red-300 mb-4">{userError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <div ref={mountRef} className="absolute inset-0 z-0" />
      
      {/* Animated background effects */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute top-20 left-10 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
          style={{
            animation: 'pulse 4s ease-in-out infinite'
          }}
        />
        <div 
          className="absolute bottom-20 right-10 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl animate-pulse"
          style={{
            animation: 'pulse 4s ease-in-out infinite',
            animationDelay: '2s'
          }}
        />
      </div>
      
      {/* Header */}
      <nav className="bg-gray-900/60 backdrop-blur-lg border-b border-gray-800/50 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToDashboard}
                className="bg-gray-800/80 text-purple-300 border border-purple-600/30 rounded-lg px-3 py-2 flex items-center hover:scale-105 transition-transform"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </button>
              <h1 className="text-xl sm:text-2xl font-bold text-purple-400">Settings</h1>
            </div>
            <div className="flex items-center bg-gray-800/60 px-3 py-2 rounded-lg">
              <User className="w-5 h-5 mr-2 text-purple-400" />
              <span className="text-sm text-gray-300">{profile.name || 'Loading...'}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-4 sm:p-6 relative z-10">
        {/* Success/Error Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg transition-all duration-300 ${
              message.includes('successfully')
                ? 'bg-green-500/20 border border-green-500/30 text-green-300'
                : 'bg-red-500/20 border border-red-500/30 text-red-300'
            }`}
          >
            {message}
          </div>
        )}

        <div className="bg-gray-900/60 backdrop-blur-lg rounded-2xl border border-gray-800/50 overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Sidebar */}
            <div className="lg:w-64 bg-gray-800/30 border-r border-gray-700/50 p-6">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 rounded-lg transition-all hover:scale-102 ${
                      activeTab === tab.id
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'text-gray-300 hover:bg-gray-800/50'
                    }`}
                  >
                    <tab.icon className="w-5 h-5 mr-3" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
            
            {/* Content */}
            <div className="flex-1 p-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <User className="w-8 h-8 text-purple-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-purple-400">Profile Information</h2>
                      <p className="text-gray-400">Update your personal details</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                      label="Full Name"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      icon={User}
                      placeholder="Enter your full name"
                    />
                    <InputField
                      label="Email Address"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      icon={Mail}
                      placeholder="Enter your email address"
                    />
                    <InputField
                      label="Phone Number"
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      icon={Phone}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  
                  <button
                    onClick={() => handleSave('profile')}
                    disabled={saving}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg flex items-center disabled:opacity-50 transition-all hover:scale-102"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
              
              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <Shield className="w-8 h-8 text-purple-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-purple-400">Security Settings</h2>
                      <p className="text-gray-400">Update your password and security preferences</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <InputField
                      label="Current Password"
                      value={security.current}
                      onChange={(e) => setSecurity({ ...security, current: e.target.value })}
                      icon={Lock}
                      placeholder="Enter your current password"
                      showToggle={{ show: showPassword.current }}
                      onToggleShow={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                    />
                    <InputField
                      label="New Password"
                      value={security.new}
                      onChange={(e) => setSecurity({ ...security, new: e.target.value })}
                      icon={Lock}
                      placeholder="Enter your new password"
                      showToggle={{ show: showPassword.new }}
                      onToggleShow={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                    />
                    <InputField
                      label="Confirm New Password"
                      value={security.confirm}
                      onChange={(e) => setSecurity({ ...security, confirm: e.target.value })}
                      icon={Lock}
                      placeholder="Confirm your new password"
                      showToggle={{ show: showPassword.confirm }}
                      onToggleShow={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                    />
                  </div>
                  
                  <button
                    onClick={() => handleSave('security')}
                    disabled={saving}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg flex items-center disabled:opacity-50 transition-all hover:scale-102"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    {saving ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
        
        .hover\\:scale-105:hover {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
};

export default SettingsPage;