// app/(tabs)/library.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Storage from '../../constants/storage';
import { Song, Theme } from '../../constants/types';
import { useGlobalAudio } from '../../constants/_audioContext';

export default function FavoritesLibrary() {
  const [favSongs, setFavSongs] = useState<Song[]>([]);
  
  // Global Audio with enhanced controls
  const { 
    currentSong, 
    isPlaying, 
    togglePlay, 
    playSong,
    playNext,
    playPrevious 
  } = useGlobalAudio();

  useEffect(() => {
    const load = async () => {
      const ids = await Storage.getFavs();
      if (ids.length > 0) {
        try {
          const res = await fetch(`https://saavn.sumit.co/api/songs/${ids.join(',')}`);
          const json = await res.json();
          if (json.success) {
            const mapped = json.data.map((item: any) => ({
              id: item.id,
              title: item.name,
              artist: item.artists?.primary?.[0]?.name || 'Unknown',
              artwork: item.image?.[2]?.url || '',
              url: item.downloadUrl?.[4]?.url || item.downloadUrl?.[3]?.url || '',
            }));
            setFavSongs(mapped);
          }
        } catch (error) {
          console.error('Failed to load favorites:', error);
        }
      }
    };
    load();
  }, []);

  const playFavSong = (song: Song, index: number) => {
    playSong(song, favSongs, index);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Liked Songs</Text>
      
      <FlatList 
        data={favSongs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 140 }}
        renderItem={({ item, index }) => (
          <TouchableOpacity style={styles.row} onPress={() => playFavSong(item, index)}>
            <Image source={{ uri: item.artwork }} style={styles.artwork} />
            <View style={styles.info}>
              <Text style={styles.songTitle}>{item.title}</Text>
              <Text style={styles.artist}>{item.artist}</Text>
            </View>
            <Ionicons name="play-circle" size={28} color="#1DB954" />
          </TouchableOpacity>
        )}
      />

      {/* ENHANCED MINI PLAYER */}
      {currentSong && (
        <View style={styles.miniPlayer}>
          <Image source={{ uri: currentSong.artwork }} style={styles.miniArt} />
          
          <View style={styles.miniInfo}>
            <Text numberOfLines={1} style={styles.miniTitle}>{currentSong.title}</Text>
            <Text numberOfLines={1} style={styles.miniArtist}>{currentSong.artist}</Text>
          </View>

          <View style={styles.miniControls}>
            {/* Previous Button */}
            <TouchableOpacity 
              onPress={playPrevious}
              style={styles.controlButton}
            >
              <Ionicons name="play-skip-back" size={26} color="#fff" />
            </TouchableOpacity>

            {/* Play/Pause Button */}
            <TouchableOpacity onPress={togglePlay} style={styles.playButton}>
              <Ionicons 
                name={isPlaying ? 'pause-circle' : 'play-circle'} 
                size={42} 
                color="#1DB954" 
              />
            </TouchableOpacity>

            {/* Next Button */}
            <TouchableOpacity 
              onPress={playNext}
              style={styles.controlButton}
            >
              <Ionicons name="play-skip-forward" size={26} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Theme.bg, 
    paddingHorizontal: 20 
  },
  title: { 
    color: '#fff', 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginVertical: 20 
  },
  row: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 12, 
    borderBottomWidth: 0.5, 
    borderBottomColor: '#333' 
  },
  artwork: { 
    width: 56, 
    height: 56, 
    borderRadius: 6, 
    marginRight: 14 
  },
  info: { flex: 1 },
  songTitle: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: '600' 
  },
  artist: { 
    color: '#b3b3b3', 
    fontSize: 13.5 
  },

  // Enhanced Mini Player Styles
  miniPlayer: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    height: 76,
    backgroundColor: '#282828',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  miniArt: { 
    width: 52, 
    height: 52, 
    borderRadius: 6 
  },
  miniInfo: { 
    flex: 1, 
    marginLeft: 12 
  },
  miniTitle: { 
    color: 'white', 
    fontWeight: '600', 
    fontSize: 14 
  },
  miniArtist: { 
    color: '#b3b3b3', 
    fontSize: 12.5 
  },
  miniControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    padding: 8,
    marginHorizontal: 4,
  },
  playButton: {
    marginHorizontal: 8,
  },
});