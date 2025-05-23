import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Programs from './components/Programs';
import About from './components/About';
import WhyChoose from './components/WhyChoose';
import Services from './components/Services';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import Contact from './components/Contact';
import Founder from './components/Founder';
import Footer from './components/Footer';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

function App() {
  const [isMobile, setIsMobile] = useState(false);
  const [isLowEndDevice, setIsLowEndDevice] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
      setIsLowEndDevice(navigator.hardwareConcurrency <= 4);
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: isMobile ? 10 : 20 },
    animate: { opacity: 1, y: 0 },
    transition: { 
      duration: isMobile ? 0.3 : 0.6,
      ease: "easeOut"
    }
  };

  return (
    <AnimatePresence mode='wait'>
      <motion.div 
        className={`min-h-screen bg-black ${isLowEndDevice ? 'reduce-motion' : ''}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: isMobile ? 0.3 : 0.5 }}
      >
        <Navbar />
        <motion.div {...fadeInUp} transition={{ 
          delay: isMobile ? 0.1 : 0.2,
          duration: isLowEndDevice ? 0.2 : (isMobile ? 0.3 : 0.5)
        }}>
          <Hero />
        </motion.div>
        {/* <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
          <Features />
        </motion.div> */}
        <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
          <Programs />
        </motion.div>
        <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
          <About />
        </motion.div>
        {/* <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
          <WhyChoose />
        </motion.div> */}
        <motion.div {...fadeInUp} transition={{ delay: 0.5 }}>
          <Services />
        </motion.div>
        <motion.div {...fadeInUp} transition={{ delay: 0.6 }}>
          <Testimonials />
        </motion.div>
        <motion.div {...fadeInUp} transition={{ delay: 0.7 }}>
          <FAQ />
        </motion.div>
        <motion.div {...fadeInUp} transition={{ delay: 0.8 }}>
          <Contact />
        </motion.div>
        <motion.div {...fadeInUp} transition={{ delay: 0.9 }}>
          <Founder />
        </motion.div>
        <motion.div {...fadeInUp} transition={{ delay: 1.0 }}>
          <Footer />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default App;



// import React, { lazy, Suspense, useEffect, useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useInView } from 'react-intersection-observer';
// import Navbar from './components/Navbar';
// import Hero from './components/Hero';

// const Programs = lazy(() => import('./components/Programs'));
// const About = lazy(() => import('./components/About'));
// const Services = lazy(() => import('./components/Services'));
// const Testimonials = lazy(() => import('./components/Testimonials'));
// const FAQ = lazy(() => import('./components/FAQ'));
// const Contact = lazy(() => import('./components/Contact'));
// const Founder = lazy(() => import('./components/Founder'));
// const Footer = lazy(() => import('./components/Footer'));

// function App() {
//   const [componentsReady, setComponentsReady] = useState(false);
//   const [isMobile, setIsMobile] = useState(false);

//   useEffect(() => {
//     setIsMobile(window.innerWidth <= 768);
    
//     const handleResize = () => {
//       setIsMobile(window.innerWidth <= 768);
//     };
    
//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   useEffect(() => {
//     const preloadComponents = async () => {
//       const imports = [
//         import('./components/Programs'),
//         import('./components/About'),
//         import('./components/Services'),
//         import('./components/Testimonials'),
//         import('./components/FAQ'),
//         import('./components/Contact'),
//         import('./components/Founder'),
//         import('./components/Footer')
//       ];
      
//       await Promise.all(imports);
//       setComponentsReady(true);
//     };
    
//     preloadComponents();
    
//     const optimize3D = () => {
//       const canvases = document.querySelectorAll('canvas');
//       canvases.forEach(canvas => {
//         if (isMobile) {
//           canvas.style.width = '100%';
//           canvas.style.height = 'auto';
//           canvas.style.maxHeight = '70vh';
//         }
//       });
//     };
    
//     if (componentsReady) {
//       setTimeout(optimize3D, 100);
//     }
//   }, [isMobile, componentsReady]);

//   const fadeInUp = {
//     initial: { opacity: 0, y: isMobile ? 10 : 20 },
//     animate: { opacity: 1, y: 0 },
//     transition: { 
//       duration: isMobile ? 0.4 : 0.6,
//       delay: isMobile ? 0.1 : 0.2 
//     }
//   };

//   const VisibleSection = ({ children, delay }) => {
//     const [ref, inView] = useInView({
//       triggerOnce: true,
//       threshold: 0.1,
//       rootMargin: '100px 0px'
//     });
    
//     return (
//       <motion.div 
//         ref={ref}
//         initial={{ opacity: 0, y: isMobile ? 10 : 20 }}
//         animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: isMobile ? 10 : 20 }}
//         transition={{ 
//           duration: isMobile ? 0.4 : 0.6,
//           delay: isMobile ? delay * 0.5 : delay 
//         }}
//       >
//         {children}
//       </motion.div>
//     );
//   };

//   return (
//     <AnimatePresence>
//       <motion.div 
//         className="min-h-screen bg-gradient-to-b from-dark-100 to-dark-200 overflow-hidden"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ duration: isMobile ? 0.3 : 0.5 }}
//       >
//         <Navbar />
        
//         <motion.div {...fadeInUp}>
//           <Hero />
//         </motion.div>
        
//         {componentsReady && (
//           <>
//             <VisibleSection delay={0.2}>
//               <Suspense fallback={null}>
//                 <Programs />
//               </Suspense>
//             </VisibleSection>
            
//             <VisibleSection delay={0.3}>
//               <Suspense fallback={null}>
//                 <About />
//               </Suspense>
//             </VisibleSection>
            
//             <VisibleSection delay={0.5}>
//               <Suspense fallback={null}>
//                 <Services />
//               </Suspense>
//             </VisibleSection>
            
//             <VisibleSection delay={0.6}>
//               <Suspense fallback={null}>
//                 <Testimonials />
//               </Suspense>
//             </VisibleSection>
            
//             <VisibleSection delay={0.7}>
//               <Suspense fallback={null}>
//                 <FAQ />
//               </Suspense>
//             </VisibleSection>
            
//             <VisibleSection delay={0.8}>
//               <Suspense fallback={null}>
//                 <Contact />
//               </Suspense>
//             </VisibleSection>
            
//             <VisibleSection delay={0.9}>
//               <Suspense fallback={null}>
//                 <Founder />
//               </Suspense>
//             </VisibleSection>
            
//             <VisibleSection delay={1.0}>
//               <Suspense fallback={null}>
//                 <Footer />
//               </Suspense>
//             </VisibleSection>
//           </>
//         )}
//       </motion.div>
//     </AnimatePresence>
//   );
// }

// export default App;