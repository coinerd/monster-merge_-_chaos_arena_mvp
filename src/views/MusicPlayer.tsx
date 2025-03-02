import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { AnimationService } from './animation/AnimationService';

interface MusicPlayerProps {
  defaultEnabled?: boolean;
}

/**
 * A component that controls background music playback (View)
 */
const MusicPlayer: React.FC<MusicPlayerProps> = ({ defaultEnabled = true }) => {
  const [isPlaying, setIsPlaying] = useState(defaultEnabled);
  const [isLoaded, setIsLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Get button animations from service
  const getButtonHover = AnimationService.getButtonHoverAnimation;
  const getButtonTap = AnimationService.getButtonTapAnimation;

  useEffect(() => {
    // Try to load user preference from localStorage
    const savedPreference = localStorage.getItem('musicEnabled');
    if (savedPreference !== null) {
      setIsPlaying(savedPreference === 'true');
    }

    // Create audio element
    const audio = new Audio();
    audio.loop = true;
    audio.volume = 0.5;
    audio.preload = 'auto';
    
    // Check if music file exists
    const musicFile = '/music/background-music.mp3';
    fetch(musicFile)
      .then(response => {
        if (response.ok) {
          audio.src = musicFile;
          audio.addEventListener('canplaythrough', () => {
            setIsLoaded(true);
            if (savedPreference !== 'false' && defaultEnabled) {
              audio.play().catch(err => console.log('Auto-play prevented:', err));
            }
          });
        } else {
          console.log('Music file not found. Please upload a file to /music/background-music.mp3');
          setIsLoaded(false);
        }
      })
      .catch(err => {
        console.log('Error loading music file:', err);
        setIsLoaded(false);
      });

    audioRef.current = audio;

    // Cleanup
    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [defaultEnabled]);

  useEffect(() => {
    if (!audioRef.current || !isLoaded) return;
    
    if (isPlaying) {
      audioRef.current.play().catch(err => {
        console.log('Error playing audio:', err);
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }

    // Save preference to localStorage
    localStorage.setItem('musicEnabled', isPlaying.toString());
  }, [isPlaying, isLoaded]);

  const toggleMusic = () => {
    setIsPlaying(prev => !prev);
  };

  return (
    <motion.button
      onClick={toggleMusic}
      className="fixed bottom-4 right-4 bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-full shadow-lg z-50"
      title={isPlaying ? 'Mute Music' : 'Play Music'}
      disabled={!isLoaded}
      whileHover={getButtonHover("rgba(109, 40, 217, 0.7)")}
      whileTap={getButtonTap()}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      {isPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
    </motion.button>
  );
};

export default MusicPlayer;
