import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Quote, Code, Zap, ChevronRight } from 'lucide-react';
import * as THREE from 'three';

const Founder = () => {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });
  
  const mountRef = useRef(null);
  const animationRef = useRef();

  useEffect(() => {
    // Set up scene
    const scene = new THREE.Scene();
    
    // Set up camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    
    // Set up renderer with better antialias for smoother particles
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    
    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }
    
    // Create two particle systems for more depth and complexity
    // First particle system - distant stars
    const particlesGeometry1 = new THREE.BufferGeometry();
    const particlesCount1 = 2000;
    
    const posArray1 = new Float32Array(particlesCount1 * 3);
    for (let i = 0; i < particlesCount1 * 3; i++) {
      posArray1[i] = (Math.random() - 0.5) * 20;
    }
    
    particlesGeometry1.setAttribute('position', new THREE.BufferAttribute(posArray1, 3));
    
    const particlesMaterial1 = new THREE.PointsMaterial({
      size: 0.02,
      color: 0x7c3aed, // Purple
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    
    const particlesMesh1 = new THREE.Points(particlesGeometry1, particlesMaterial1);
    scene.add(particlesMesh1);
    
    // Second particle system - closer, brighter particles
    const particlesGeometry2 = new THREE.BufferGeometry();
    const particlesCount2 = 1000;
    
    const posArray2 = new Float32Array(particlesCount2 * 3);
    for (let i = 0; i < particlesCount2 * 3; i++) {
      posArray2[i] = (Math.random() - 0.5) * 10;
    }
    
    particlesGeometry2.setAttribute('position', new THREE.BufferAttribute(posArray2, 3));
    
    const particlesMaterial2 = new THREE.PointsMaterial({
      size: 0.04,
      color: 0x4f46e5, // Indigo
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    
    const particlesMesh2 = new THREE.Points(particlesGeometry2, particlesMaterial2);
    scene.add(particlesMesh2);
    
    // Add some ambient light
    const ambientLight = new THREE.AmbientLight(0x6d28d9, 0.5);
    scene.add(ambientLight);
    
    // Add a point light
    const pointLight = new THREE.PointLight(0x8b5cf6, 1);
    pointLight.position.set(2, 3, 4);
    scene.add(pointLight);
    
    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Animation loop with automated movement instead of mouse interaction
    const clock = new THREE.Clock();
    
    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      
      // Rotate both particle systems at different speeds for parallax effect
      particlesMesh1.rotation.x += 0.0002;
      particlesMesh1.rotation.y += 0.0003;
      
      particlesMesh2.rotation.x += 0.0004;
      particlesMesh2.rotation.y += 0.0005;
      
      // Gentle automated floating movement with sine waves instead of mouse position
      particlesMesh1.position.x = Math.sin(elapsedTime * 0.2) * 0.5;
      particlesMesh1.position.y = Math.cos(elapsedTime * 0.1) * 0.5;
      
      particlesMesh2.position.x = Math.sin(elapsedTime * 0.3) * 0.3;
      particlesMesh2.position.y = Math.cos(elapsedTime * 0.2) * 0.3;
      
      renderer.render(scene, camera);
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      scene.remove(particlesMesh1);
      scene.remove(particlesMesh2);
      particlesGeometry1.dispose();
      particlesGeometry2.dispose();
      particlesMaterial1.dispose();
      particlesMaterial2.dispose();
    };
  }, []);

  // Sleek futuristic animations
  const containerAnimation = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.15
      }
    }
  };

  const itemAnimation = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  const glowAnimation = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: [0.5, 0.8, 0.5],
      scale: 1,
      transition: {
        opacity: {
          repeat: Infinity,
          duration: 3,
          repeatType: "reverse"
        },
        scale: {
          duration: 0.8,
          type: "spring",
          stiffness: 200
        }
      }
    }
  };

  const iconAnimation = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    }
  };

  const imageContainerAnimation = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        delay: 0.4
      }
    }
  };

  const techIconsData = [
    { icon: <Code size={16} />, delay: 0 },
    { icon: <Zap size={16} />, delay: 0.1 }
  ];

  return (
    <section className="py-20 bg-black relative overflow-hidden">
      {/* 3D Background container */}
      <div ref={mountRef} className="absolute inset-0 z-0" style={{ pointerEvents: 'none' }} />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={containerAnimation}
          className="bg-dark-300/60 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-dark-400"
        >
          {/* Decorative glowing elements */}
          <motion.div
            className="absolute -top-10 -left-10 w-48 h-48 bg-primary-500/20 rounded-full blur-3xl"
            variants={glowAnimation}
          />
          <motion.div
            className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl"
            variants={glowAnimation}
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <motion.div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center relative z-10">
              {/* Tech details floating elements */}
              <div className="absolute top-12 right-12 flex space-x-2">
                {techIconsData.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      transition: {
                        delay: 1 + item.delay,
                        duration: 0.5
                      }
                    }}
                    className="bg-dark-400/80 backdrop-blur-md h-8 w-8 rounded-full flex items-center justify-center text-primary-400"
                  >
                    {item.icon}
                  </motion.div>
                ))}
              </div>
              
              <motion.div 
                className="mb-6 relative"
                variants={iconAnimation}
              >
                <motion.div 
                  className="absolute -inset-3 bg-primary-500/20 rounded-full blur-md"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.4, 0.2]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                />
                <Quote className="h-12 w-12 text-primary-400 relative z-10" />
              </motion.div>
              
              <motion.div
                className="absolute -left-2 top-1/2 w-1 h-40 bg-gradient-to-b from-primary-600/0 via-primary-600 to-primary-600/0"
                animate={{
                  height: ["30%", "60%", "30%"],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              />
              
              <motion.h2 
                className="text-2xl md:text-3xl font-bold text-white mb-6 font-display"
                variants={itemAnimation}
              >
                <motion.span
                  initial={{ display: "inline-block" }}
                  animate={{ color: ["#ffffff", "#a78bfa", "#ffffff"] }}
                  transition={{ 
                    duration: 5,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  Founder's Note
                </motion.span>
              </motion.h2>
              
              <motion.p 
                className="text-gray-300 mb-6"
                variants={itemAnimation}
              >
                At SpectoV, our vision has always been to bridge the gap between talent and opportunity. We believe that anyone—whether a student aiming for their dream job or a professional looking to shift into tech—deserves the right guidance, training, and opportunities to succeed.
              </motion.p>
              
              <motion.p 
                className="text-gray-300 mb-6"
                variants={itemAnimation}
              >
                Our mission is to create a learning ecosystem that is accessible, industry-focused, and career-driven. Through hands-on training, expert mentorship, and guaranteed placements, we are committed to transforming aspiring developers into top-tier tech professionals.
              </motion.p>
              
              <motion.p 
                className="text-gray-300 mb-8"
                variants={itemAnimation}
              >
                If you're ready to unlock your full potential, we are here to guide you every step of the way. Let's build the future together! 🚀
              </motion.p>
              
              <motion.div 
                className="flex items-center relative"
                variants={itemAnimation}
                whileHover={{ scale: 1.03 }}
              >
                <motion.div className="relative mr-4">
                  <motion.div 
                    className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full blur opacity-70"
                    animate={{ 
                      rotate: [0, 360],
                      scale: [0.9, 1.1, 0.9] 
                    }}
                    transition={{ 
                      rotate: {
                        duration: 10,
                        repeat: Infinity,
                        ease: "linear"
                      },
                      scale: {
                        duration: 4,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }
                    }}
                  />
                  <img 
                    src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80" 
                    alt="Vanshmani Jha" 
                    className="h-14 w-14 rounded-full object-cover relative z-10 border-2 border-primary-500"
                  />
                </motion.div>
                <div>
                  <motion.p 
                    className="font-bold text-white"
                    whileHover={{ color: "#a78bfa" }}
                  >
                    Vanshmani Jha
                  </motion.p>
                  <div className="flex items-center gap-1">
                    <p className="text-gray-400 text-sm">Founder & CEO, SpectoV</p>
                    <motion.span
                      animate={{
                        x: [0, 4, 0]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    >
                      <ChevronRight size={14} className="text-primary-400" />
                    </motion.span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="relative h-64 lg:h-auto overflow-hidden"
              variants={imageContainerAnimation}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary-900/80 via-transparent to-primary-800/80 z-10"
                animate={{
                  backgroundPosition: ['0% 0%', '100% 100%'],
                }}
                transition={{
                  duration: 15,
                  repeat: Infinity,
                  repeatType: "mirror",
                  ease: "linear"
                }}
              />
              
              <motion.img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80" 
                alt="Team collaboration" 
                className="absolute inset-0 w-full h-full object-cover"
                initial={{ scale: 1 }}
                animate={{ 
                  scale: [1, 1.05, 1],
                  filter: ["brightness(0.8)", "brightness(1)", "brightness(0.8)"]
                }}
                transition={{ 
                  duration: 10,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              />
              
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <motion.div 
                  className="text-center text-white p-6 backdrop-blur-md bg-dark-800/30 rounded-xl border border-dark-400/50"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  whileHover={{ 
                    scale: 1.03,
                    boxShadow: "0 0 30px rgba(124, 58, 237, 0.4)"
                  }}
                >
                  <motion.h3 
                    className="text-2xl font-bold mb-2 font-display"
                    animate={{
                      textShadow: ["0px 0px 0px rgba(124, 58, 237, 0)", "0px 0px 10px rgba(124, 58, 237, 0.8)", "0px 0px 0px rgba(124, 58, 237, 0)"],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    Join Our Community
                  </motion.h3>
                  <p className="mb-6 max-w-md">Be part of a growing network of tech professionals and enthusiasts.</p>
                  
                  <motion.button
                    className="bg-white text-primary-600 px-6 py-3 rounded-full font-medium transition-colors relative overflow-hidden group"
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: "0 0 20px rgba(124, 58, 237, 0.6)" 
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.span
                      className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/30 to-indigo-500/0"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.5 }}
                    />
                    Apply Now
                    <motion.span
                      className="inline-block ml-1"
                      animate={{
                        x: [0, 5, 0]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    >
                      <ChevronRight size={16} />
                    </motion.span>
                  </motion.button>
                </motion.div>
              </div>
              
              {/* Futuristic data points */}
              <motion.div 
                className="absolute top-4 right-4 bg-dark-500/70 backdrop-blur-md px-3 py-1 rounded-full text-xs text-primary-300 border border-primary-500/30"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1, duration: 0.6 }}
              >
                <motion.span
                  animate={{
                    opacity: [1, 0.5, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  <Zap size={12} className="inline mr-1" />
                </motion.span>
                100% Placement Rate
              </motion.div>
              
              <motion.div 
                className="absolute bottom-4 left-4 bg-dark-500/70 backdrop-blur-md px-3 py-1 rounded-full text-xs text-primary-300 border border-primary-500/30"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
              >
                <motion.span
                  animate={{
                    opacity: [1, 0.5, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  <Code size={12} className="inline mr-1" />
                </motion.span>
                Industry-Leading Curriculum
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Founder;