import React, { createContext, useContext, useState, useRef } from 'react';
import { Animated } from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Song } from './types';

const PlayerContext = createContext<any>(null);

export const PlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  const [currentQueue, setCurrentQueue] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const player = useAudioPlayer('');
  const status = useAudioPlayerStatus(player);

  const rotationAnim = useRef(new Animated.Value(0)).current;
  const isRotating = useRef(false);

  const startRotation = () => {
    if (isRotating.current) return;
    isRotating.current = true;
    rotationAnim.setValue(0);
    Animated.loop(
      Animated.timing(rotationAnim, { toValue: 1, duration: 28000, useNativeDriver: true })
    ).start();
  };

  const stopRotation = () => {
    isRotating.current = false;
    rotationAnim.stopAnimation();
  };

  const playSong = (song: Song, queue: Song[], index: number) => {
    if (!song.url) return;
    setCurrentSong(song);
    setCurrentQueue(queue);
    setCurrentIndex(index);
    player.replace(song.url);
    player.play();
    startRotation();
  };

  const togglePlay = () => {
    if (status.playing) {
      player.pause();
      stopRotation();
    } else if (currentSong?.url) {
      player.play();
      startRotation();
    }
  };

  const playNext = () => {
    if (currentQueue.length === 0) return;
    const nextIndex = (currentIndex + 1) % currentQueue.length;
    playSong(currentQueue[nextIndex], currentQueue, nextIndex);
  };

  const playPrevious = () => {
    if (currentQueue.length === 0) return;
    const prevIndex = (currentIndex - 1 + currentQueue.length) % currentQueue.length;
    playSong(currentQueue[prevIndex], currentQueue, prevIndex);
  };

  return (
    <PlayerContext.Provider value={{
      currentSong, isPlayerVisible, setIsPlayerVisible,
      player, status, playSong, togglePlay, playNext, playPrevious,
      rotationAnim, startRotation, stopRotation
    }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => useContext(PlayerContext);