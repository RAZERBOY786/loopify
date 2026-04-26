// app/(tabs)/_audioContext.tsx
import { 
  setAudioModeAsync, 
  useAudioPlayer, 
  useAudioPlayerStatus 
} from 'expo-audio';
import React, { createContext, ReactNode, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { Animated, Easing, Platform } from 'react-native';
import { Song } from './types';

// Optional: Import from expo-media-control if you want extra remote event handling
// import * as MediaControl from 'expo-media-control';

type AudioContextType = {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  queue: Song[];
  currentIndex: number;
  
  playSong: (song: Song, queue?: Song[], index?: number) => Promise<void>;
  togglePlay: () => Promise<void>;
  playNext: () => Promise<void>;
  playPrevious: () => Promise<void>;
  seekTo: (time: number) => void;
  
  // For Full Player Modal
  isFullPlayerVisible: boolean;
  openFullPlayer: () => void;
  closeFullPlayer: () => void;
  rotationAnim: Animated.Value;
};

const AudioContext = createContext<AudioContextType | undefined>(undefined);

const API_BASE = 'https://saavn.sumit.co/api';

export const AudioProvider = ({ children }: { children: ReactNode }) => {
  const player = useAudioPlayer('');
  const status = useAudioPlayerStatus(player);

  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullPlayerVisible, setIsFullPlayerVisible] = useState(false);

  const rotationAnim = useRef(new Animated.Value(0)).current;
  const isRotating = useRef(false);

  const startRotation = () => {
    if (isRotating.current) return;
    isRotating.current = true;
    Animated.loop(
      Animated.timing(rotationAnim, { 
        toValue: 1, 
        duration: 28000, 
        easing: Easing.linear,
        useNativeDriver: true 
      })
    ).start();
  };

  const stopRotation = () => {
    isRotating.current = false;
    rotationAnim.stopAnimation();
  };

  // Update system media notification + lock screen metadata
  const updateMediaMetadata = useCallback(async (song: Song | null) => {
    if (!song?.title) return;

    try {
      // This is the main way with expo-audio to show rich media controls
      // expo-media-control plugin helps with native setup
      if (Platform.OS === 'android') {
        // Android uses foreground service + notification automatically with proper config
        await player.setMetadata?.({
          title: song.title,
          artist: song.artist,
          artwork: song.artwork ? { uri: song.artwork } : undefined,
        });
      } else if (Platform.OS === 'ios') {
        // iOS uses Control Center / Lock Screen
        await player.setMetadata?.({
          title: song.title,
          artist: song.artist,
          artwork: song.artwork ? { uri: song.artwork } : undefined,
        });
      }
    } catch (error) {
      console.error('Failed to update media metadata:', error);
    }
  }, [player]);

  // Helper to fetch related songs when queue ends
  const playRelatedSongs = async (songId: string) => {
    try {
      const res = await fetch(`${API_BASE}/songs/${songId}/suggestions`);
      const json = await res.json();

      if (json.success && json.data?.length > 0) {
        const suggestions: Song[] = json.data.map((s: any) => ({
          id: s.id,
          title: s.name,
          artist: s.artists?.primary?.[0]?.name || 'Unknown',
          artwork: s.image?.[2]?.url || s.image?.[1]?.url || '',
          url: s.downloadUrl?.[4]?.url || s.downloadUrl?.[3]?.url || '',
        }));

        const nextSong = suggestions[0];
        
        setQueue((prev) => [...prev, ...suggestions]);
        setCurrentIndex((prev) => prev + 1);
        setCurrentSong(nextSong);

        player.replace(nextSong.url);
        await player.play();
        startRotation();
        await updateMediaMetadata(nextSong);
      } else {
        playNext();
      }
    } catch (error) {
      console.error('Failed to fetch related songs:', error);
      playNext();
    }
  };

  const playSong = async (song: Song, newQueue: Song[] = [song], index: number = 0) => {
    if (!song?.url) return;

    setCurrentSong(song);
    setQueue(newQueue);
    setCurrentIndex(index);

    player.replace(song.url);
    await player.play();
    startRotation();
    await updateMediaMetadata(song);
  };

  const togglePlay = async () => {
    if (status.playing) {
      await player.pause();
      stopRotation();
    } else if (currentSong?.url) {
      await player.play();
      startRotation();
    }
  };

  const playNext = async () => {
    if (queue.length === 0) return;
    
    const nextIndex = (currentIndex + 1) % queue.length;
    const nextSong = queue[nextIndex];
    
    setCurrentIndex(nextIndex);
    setCurrentSong(nextSong);
    player.replace(nextSong.url);
    await player.play();
    startRotation();
    await updateMediaMetadata(nextSong);
  };

  const playPrevious = async () => {
    if (queue.length === 0) return;
    
    const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
    const prevSong = queue[prevIndex];
    
    setCurrentIndex(prevIndex);
    setCurrentSong(prevSong);
    player.replace(prevSong.url);
    await player.play();
    startRotation();
    await updateMediaMetadata(prevSong);
  };

  const seekTo = (time: number) => {
    player.seekTo(time);
  };

  const openFullPlayer = () => setIsFullPlayerVisible(true);
  const closeFullPlayer = () => setIsFullPlayerVisible(false);

  // Auto play next when song finishes
  useEffect(() => {
    if (status.didJustFinish && currentSong) {
      if (currentIndex === queue.length - 1) {
        playRelatedSongs(currentSong.id);
      } else {
        playNext();
      }
    }
  }, [status.didJustFinish]);

  // Sync rotation animation
  useEffect(() => {
    if (status.playing) {
      startRotation();
    } else {
      stopRotation();
    }
  }, [status.playing]);

  // Initial background + media session setup
  useEffect(() => {
    const setupBackground = async () => {
      try {
        await setAudioModeAsync({
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: false,
          playThroughEarpieceAndroid: false,
          interruptionModeAndroid: 'doNotMix',
          interruptionModeIOS: 'doNotMix',
        });

        // Activate media controls (especially important on Android)
        // This works together with your expo-media-control plugin
        if (Platform.OS === 'android') {
          // The plugin + FOREGROUND_SERVICE_MEDIA_PLAYBACK permission handles notification
        }
      } catch (error) {
        console.error('Background audio setup failed:', error);
      }
    };

    setupBackground();
  }, []);

  // Update metadata whenever current song changes
  useEffect(() => {
    if (currentSong) {
      updateMediaMetadata(currentSong);
    }
  }, [currentSong, updateMediaMetadata]);

  const value: AudioContextType = {
    currentSong,
    isPlaying: status.playing,
    currentTime: status.currentTime || 0,
    duration: status.duration || 0,
    queue,
    currentIndex,
    playSong,
    togglePlay,
    playNext,
    playPrevious,
    seekTo,
    isFullPlayerVisible,
    openFullPlayer,
    closeFullPlayer,
    rotationAnim,
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};

export const useGlobalAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useGlobalAudio must be used within an AudioProvider');
  }
  return context;
};