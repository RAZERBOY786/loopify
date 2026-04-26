import React, { createContext, useContext, useState, useEffect } from 'react';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';

export type Song = {
  id: string;
  title: string;
  artist: string;
  artwork: string;
  url: string;
};

interface PlayerContextType {
  currentSong: Song | null;
  status: { playing: boolean; currentTime: number; duration: number };
  playSong: (song: Song, queue: Song[], index: number) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrevious: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [status, setStatus] = useState({ playing: false, currentTime: 0, duration: 1 });

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
      playThroughEarpieceAndroid: false,
    });
  }, []);

  async function playSong(song: Song, newQueue: Song[], index: number) {
    if (sound) await sound.unloadAsync();
    
    setQueue(newQueue);
    setCurrentIndex(index);
    setCurrentSong(song);

    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri: song.url },
      { shouldPlay: true },
      (status: any) => {
        if (status.isLoaded) {
          setStatus({
            playing: status.isPlaying,
            currentTime: status.positionMillis / 1000,
            duration: status.durationMillis ? status.durationMillis / 1000 : 1,
          });
          if (status.didJustFinish) playNext();
        }
      }
    );
    setSound(newSound);
  }

  const togglePlay = async () => {
    if (!sound) return;
    status.playing ? await sound.pauseAsync() : await sound.playAsync();
  };

  const playNext = () => {
    const nextIdx = (currentIndex + 1) % queue.length;
    if (queue[nextIdx]) playSong(queue[nextIdx], queue, nextIdx);
  };

  const playPrevious = () => {
    const prevIdx = (currentIndex - 1 + queue.length) % queue.length;
    if (queue[prevIdx]) playSong(queue[prevIdx], queue, prevIdx);
  };

  return (
    <PlayerContext.Provider value={{ currentSong, status, playSong, togglePlay, playNext, playPrevious }}>
      {children}
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error("usePlayer must be used within PlayerProvider");
  return context;
};