import React, { useEffect, useRef } from 'react';

interface ParticleEffectProps {
  isActive?: boolean;
  duration?: number;
  particleCount?: number;
  colors?: string[];
}

/**
 * A component that displays a particle effect animation
 */
const ParticleEffect: React.FC<ParticleEffectProps> = ({
  isActive = false,
  duration = 1000,
  particleCount = 30,
  colors = ['#ffcc00', '#ff6600', '#ff3300', '#ff9900']
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const particles = useRef<HTMLDivElement[]>([]);
  
  useEffect(() => {
    if (!isActive || !containerRef.current) return;
    
    // Clear any existing particles
    particles.current.forEach(particle => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    });
    particles.current = [];
    
    // Create new particles
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      
      // Random position within container
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      
      // Random size
      const size = 3 + Math.random() * 5;
      
      // Random color
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      // Random animation duration
      const animDuration = duration * (0.7 + Math.random() * 0.6);
      
      // Set styles
      particle.style.cssText = `
        position: absolute;
        left: ${x}%;
        top: ${y}%;
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        border-radius: 50%;
        opacity: 0;
        transform: translate(-50%, -50%) scale(0);
        animation: particle-animation ${animDuration}ms ease-out forwards;
      `;
      
      containerRef.current.appendChild(particle);
      particles.current.push(particle);
    }
    
    // Clean up particles after animation
    const timer = setTimeout(() => {
      particles.current.forEach(particle => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      });
      particles.current = [];
    }, duration + 100);
    
    return () => {
      clearTimeout(timer);
      particles.current.forEach(particle => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      });
      particles.current = [];
    };
  }, [isActive, duration, particleCount, colors]);
  
  return (
    <div 
      ref={containerRef} 
      className="particle-container"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10
      }}
    >
      <style>
        {`
          @keyframes particle-animation {
            0% {
              opacity: 1;
              transform: translate(-50%, -50%) scale(0);
            }
            50% {
              opacity: 0.8;
              transform: translate(
                calc(-50% + ${Math.random() > 0.5 ? '' : '-'}${20 + Math.random() * 30}px),
                calc(-50% + ${Math.random() > 0.5 ? '' : '-'}${20 + Math.random() * 30}px)
              ) scale(1);
            }
            100% {
              opacity: 0;
              transform: translate(
                calc(-50% + ${Math.random() > 0.5 ? '' : '-'}${40 + Math.random() * 60}px),
                calc(-50% + ${Math.random() > 0.5 ? '' : '-'}${40 + Math.random() * 60}px)
              ) scale(0.5);
            }
          }
        `}
      </style>
    </div>
  );
};

export default ParticleEffect;
