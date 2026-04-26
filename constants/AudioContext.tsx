import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';
import { Animated } from 'react-native';
import { Song } from './types';

const AudioContext = createContext<any>(null);

export const AudioProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);

  const player = useAudioPlayer('');
  const status = useAudioPlayerStatus(player);
  
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const rotationLoop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    setAudioModeAsync({
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
    });
  }, []);

  useEffect(() => {
    if (status.playing) {
      rotationLoop.current = Animated.loop(
        Animated.timing(rotationAnim, { toValue: 1, duration: 28000, useNativeDriver: true })
      );
      rotationLoop.current.start();
    } else {
      rotationLoop.current?.stop();
    }
  }, [status.playing]);

  const playSong = (song: Song, newQueue: Song[], index: number) => {
    if (!song.url) return;
    setCurrentSong(song);
    setQueue(newQueue);
    setCurrentIndex(index);
    player.replace(song.url);
    player.play();
  };

  const togglePlay = () => status.playing ? player.pause() : player.play();

  const playNext = () => {
    const nextIndex = (currentIndex + 1) % queue.length;
    playSong(queue[nextIndex], queue, nextIndex);
  };

  const playPrevious = () => {
    const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
    playSong(queue[prevIndex], queue, prevIndex);
  };

  return (
    <AudioContext.Provider value={{
      player, status, currentSong, isPlayerVisible, setIsPlayerVisible,
      rotationAnim, playSong, togglePlay, playNext, playPrevious
    }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => useContext(AudioContext);