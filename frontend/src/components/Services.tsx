import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimation, Variants } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Smartphone, Code, Database, Cpu, Glasses, BarChart } from 'lucide-react';
import * as THREE from 'three';

const Services = () => {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });
  
  const mountRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    // Set up scene
    const scene = new THREE.Scene();
    
    // Set up camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    
    // Set up renderer
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    
    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }
    
    // Create a geometry for particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 5000;
    
    const posArray = new Float32Array(particlesCount * 3);
    
    for (let i = 0; i < particlesCount * 3; i++) {
      // Create a cube of particles
      posArray[i] = (Math.random() - 0.5) * 15;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    // Create material for particles
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.03,
      color: 0x7c3aed,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending
    });
    
    // Create the particle system
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    
    // Add some ambient light
    const ambientLight = new THREE.AmbientLight(0x7c3aed, 0.5);
    scene.add(ambientLight);
    
    // Add a point light
    const pointLight = new THREE.PointLight(0x7c3aed, 0.8);
    pointLight.position.set(2, 3, 4);
    scene.add(pointLight);
    
    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Animation loop
    const animate = () => {
      particlesMesh.rotation.x += 0.0005;
      particlesMesh.rotation.y += 0.0005;
      
      // Non-reactive animation (no mouse interaction)
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
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      scene.remove(particlesMesh);
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  // Animations for container and title
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const titleVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.7,
        type: "spring",
        stiffness: 200,
        damping: 15
      }
    }
  };

  // Services data for cleaner code
  const services = [
    {
      icon: <Glasses className="h-10 w-10 text-primary-400" />,
      title: "AR/VR",
      description: "Pioneering the future with cutting-edge AR and VR technologies. Our experts create immersive experiences that blend the physical and digital worlds.",
      color: "from-blue-600 to-blue-800",
      highlight: "blue"
    },
    {
      icon: <BarChart className="h-10 w-10 text-primary-400" />,
      title: "Competitive Programming",
      description: "Our focus on Data Structures and Algorithms ensures that our solutions are optimized for efficiency and performance, crucial for developing high-performance applications.",
      color: "from-green-600 to-green-800",
      highlight: "green"
    },
    {
      icon: <Smartphone className="h-10 w-10 text-primary-400" />,
      title: "App Development",
      description: "Our App Development team is dedicated to creating user-friendly and high-performing mobile and web applications using the latest technologies and best practices.",
      color: "from-purple-600 to-purple-800",
      highlight: "purple"
    },
    {
      icon: <Code className="h-10 w-10 text-primary-400" />,
      title: "Full Stack Development",
      description: "Our Full Stack Development team excels in creating robust and scalable web applications with expertise in both front-end and back-end technologies.",
      color: "from-red-600 to-red-800",
      highlight: "red"
    },
    {
      icon: <Database className="h-10 w-10 text-primary-400" />,
      title: "Data Structures & Algorithms",
      description: "We employ advanced DSA techniques to solve complex problems, enabling faster processing and more effective resource management for high-performance applications.",
      color: "from-yellow-600 to-yellow-800",
      highlight: "yellow"
    },
    {
      icon: <Cpu className="h-10 w-10 text-primary-400" />,
      title: "Artificial Intelligence",
      description: "We leverage the power of AI to transform data into actionable insights, developing intelligent systems that automate processes and enhance decision-making.",
      color: "from-indigo-600 to-indigo-800",
      highlight: "indigo"
    }
  ];

  return (
    <section className="py-20 bg-black relative overflow-hidden">
      {/* Three.js Background container */}
      <div ref={mountRef} className="absolute inset-0 z-0" style={{ pointerEvents: 'none' }} />
      
      <div className="w-[95vw] container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            className="text-3xl md:text-5xl font-bold text-white mb-4 font-display"
            variants={titleVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-purple-600">
              Our Specializations
            </span>
          </motion.h2>
          <motion.p 
            className="text-lg text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Explore our diverse range of technical specializations designed to prepare you for the future of technology.
          </motion.p>
        </div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              icon={service.icon}
              title={service.title}
              description={service.description}
              color={service.color}
              highlight={service.highlight}
              delay={index * 0.1}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

interface ServiceCardProps { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  color: string;
  highlight: string;
  delay: number;
}

const ServiceCard = ({ 
  icon, 
  title, 
  description,
  color,
  highlight,
  delay
}: ServiceCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const controls = useAnimation();
  
  const cardVariants: Variants = {
    hidden: { 
      opacity: 0,
      y: 30, 
      scale: 0.9 
    },
    visible: { 
      opacity: 1,
      y: 0, 
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 200, 
        damping: 20,
        delay 
      } 
    },
    hover: { 
      y: -10,
      scale: 1.03,
      boxShadow: `0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3), 0 0 0 2px rgb(139, 92, 246, 0.3)`,
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 15 
      } 
    }
  };

  const iconVariants: Variants = {
    initial: { scale: 1, rotate: 0 },
    hover: { 
      scale: 1.2, 
      rotate: [0, -10, 10, -5, 5, 0],
      transition: { 
        duration: 0.6,
        type: "spring",
        stiffness: 300, 
        damping: 10 
      }
    }
  };

  const glowVariants: Variants = {
    initial: { opacity: 0 },
    hover: { 
      opacity: 0.6,
      transition: { duration: 0.3 }
    }
  };

  useEffect(() => {
    if (isHovered) {
      controls.start('hover');
    } else {
      controls.start('visible');
    }
  }, [isHovered, controls]);

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate={controls}
      className="bg-dark-300/80 backdrop-blur-sm rounded-xl overflow-hidden transition-all duration-300 border border-dark-400 relative"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Animated glow effect */}
      <motion.div 
        className="absolute inset-0 blur-xl rounded-xl"
        variants={glowVariants}
        initial="initial"
        animate={isHovered ? "hover" : "initial"}
        style={{ 
          backgroundColor: highlight === 'blue' ? 'rgba(59, 130, 246, 0.2)' :
                          highlight === 'green' ? 'rgba(16, 185, 129, 0.2)' :
                          highlight === 'purple' ? 'rgba(139, 92, 246, 0.2)' :
                          highlight === 'red' ? 'rgba(239, 68, 68, 0.2)' :
                          highlight === 'yellow' ? 'rgba(245, 158, 11, 0.2)' :
                          'rgba(99, 102, 241, 0.2)'
        }}
      />

      {/* Card header with gradient */}
      <div className={`bg-gradient-to-r ${color} p-6 relative overflow-hidden`}>
        {/* Animated particles in the card header */}
        {isHovered && (
          <motion.div 
            className="absolute inset-0 opacity-60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ duration: 0.5 }}
          >
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-white"
                initial={{ 
                  x: Math.random() * 100 + '%', 
                  y: Math.random() * 100 + '%',
                  opacity: Math.random() * 0.5 + 0.3
                }}
                animate={{ 
                  y: [null, Math.random() * -100], 
                  opacity: [null, 0],
                }}
                transition={{
                  duration: Math.random() * 2 + 1,
                  repeat: Infinity,
                  repeatType: 'loop',
                  ease: 'easeOut',
                  delay: Math.random() * 2
                }}
                style={{
                  width: Math.random() * 3 + 1 + 'px',
                  height: Math.random() * 3 + 1 + 'px',
                }}
              />
            ))}
          </motion.div>
        )}

        <motion.div 
          className="bg-white/20 p-3 rounded-lg inline-block mb-4 relative"
          variants={iconVariants}
          initial="initial"
          animate={isHovered ? "hover" : "initial"}
        >
          {icon}
          
          {/* Icon glow effect */}
          <motion.div 
            className="absolute inset-0 bg-white blur-md rounded-lg"
            initial={{ opacity: 0 }}
            animate={isHovered ? { opacity: 0.5 } : { opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        </motion.div>
        
        <motion.h3 
          className="text-xl font-bold text-white mb-2 relative"
          animate={isHovered ? { 
            textShadow: "0 0 8px rgba(255,255,255,0.5)",
            x: [0, -2, 3, -3, 2, 0],
            transition: { x: { duration: 0.4 } }
          } : {}}
        >
          {title}
        </motion.h3>
      </div>
      
      {/* Card content */}
      <div className="p-6 relative overflow-hidden">
        <motion.p 
          className="text-gray-300 relative z-10"
          animate={isHovered ? { color: "#ffffff" } : {}}
          transition={{ duration: 0.3 }}
        >
          {description}
        </motion.p>
        
        {/* Content background effect */}
        {isHovered && (
          <motion.div 
            className="absolute inset-0 bg-gradient-to-b from-dark-500/0 to-dark-500/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </div>
      
      {/* Bottom shine effect */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0 h-1"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={isHovered ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
        transition={{ duration: 0.5 }}
        style={{ 
          background: color.includes('blue') ? 'linear-gradient(to right, #2563eb, #3b82f6)' :
                     color.includes('green') ? 'linear-gradient(to right, #059669, #10b981)' :
                     color.includes('purple') ? 'linear-gradient(to right, #7c3aed, #8b5cf6)' :
                     color.includes('red') ? 'linear-gradient(to right, #dc2626, #ef4444)' :
                     color.includes('yellow') ? 'linear-gradient(to right, #d97706, #f59e0b)' :
                     'linear-gradient(to right, #4f46e5, #6366f1)'
        }}
      />
    </motion.div>
  );
};

export default Services;