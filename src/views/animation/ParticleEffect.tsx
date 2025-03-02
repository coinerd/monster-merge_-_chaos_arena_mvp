import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  id: string;
  x: number;
  y: number;
  color: string;
  size: number;
  angle: number;
  speed: number;
}

interface ParticleEffectProps {
  x: number;
  y: number;
  colors: string[];
  count?: number;
  duration?: number;
  minSize?: number;
  maxSize?: number;
  minSpeed?: number;
  maxSpeed?: number;
  isActive: boolean;
}

/**
 * A component that creates particle effects (View)
 */
const ParticleEffect: React.FC<ParticleEffectProps> = ({
  x,
  y,
  colors,
  count = 40,
  duration = 1000,
  minSize = 3,
  maxSize = 8,
  minSpeed = 2,
  maxSpeed = 6,
  isActive
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  // Generate particles when the effect is activated
  useEffect(() => {
    if (!isActive) {
      setParticles([]);
      return;
    }

    // Generate particles
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
      const size = minSize + Math.random() * (maxSize - minSize);
      const color = colors[Math.floor(Math.random() * colors.length)];

      newParticles.push({
        id: `particle-${i}-${Date.now()}`,
        x: 0,
        y: 0,
        color,
        size,
        angle,
        speed
      });
    }

    setParticles(newParticles);

    // Clean up particles after animation
    const timer = setTimeout(() => {
      setParticles([]);
    }, duration);

    return () => clearTimeout(timer);
  }, [isActive, count, colors, minSize, maxSize, minSpeed, maxSpeed, duration]);

  if (!isActive || particles.length === 0) {
    return null;
  }

  return (
    <div className="absolute pointer-events-none z-20" style={{ left: x, top: y }}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{ x: 0, y: 0, opacity: 1 }}
          animate={{ 
            x: Math.cos(particle.angle) * particle.speed * 50,
            y: Math.sin(particle.angle) * particle.speed * 50,
            opacity: 0,
            scale: [1, 0.8, 0.5]
          }}
          transition={{ duration: duration / 1000, ease: "easeOut" }}
          style={{ 
            position: 'absolute',
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            borderRadius: '50%',
            backgroundColor: particle.color,
            transform: 'translate(-50%, -50%)'
          }}
        />
      ))}
      
      {/* Add a central flash effect */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
          opacity: [0, 0.8, 0],
          scale: [0, 2, 3]
        }}
        transition={{ duration: 0.6 }}
        style={{
          position: 'absolute',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${colors[0]} 0%, rgba(255,255,255,0) 70%)`,
          transform: 'translate(-50%, -50%)'
        }}
      />
    </div>
  );
};

export default ParticleEffect;
