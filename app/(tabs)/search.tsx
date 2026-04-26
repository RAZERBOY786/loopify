// app/(tabs)/search.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Song } from '../../constants/types';
import { useGlobalAudio } from '../../constants/_audioContext';

const { width } = Dimensions.get('window');
const API_BASE = 'https://saavn.sumit.co/api';

const GENRES = [
  { name: 'Trending', color: '#E13300' },
  { name: 'New Releases', color: '#1E3264' },
  { name: 'Hindi Hits', color: '#8D67AB' },
  { name: 'Punjabi', color: '#E8115B' },
  { name: 'Lofi Hindi', color: '#BC5900' },
  { name: 'Exam', color: '#7113e3' },
  { name: 'English', color: '#e48a9c' },
  { name: 'Lofi', color: '#ebcaae' },
  { name: 'Bollywood', color: '#0c5d05' },
  { name: 'Workout', color: '#056952' }
];

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Global Audio with enhanced controls
  const {
    currentSong,
    isPlaying,
    togglePlay,
    playSong,
    playNext,
    playPrevious,
  } = useGlobalAudio();

  const searchSongs = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    setIsSearching(true);
    try {
      const res = await fetch(`${API_BASE}/search/songs?query=${encodeURIComponent(searchTerm)}&limit=20`);
      const json = await res.json();
      if (json.success) {
        const mappedResults = json.data.results.map((s: any) => ({
          id: s.id,
          title: s.name,
          artist: s.artists?.primary?.[0]?.name || 'Unknown',
          artwork: s.image?.[2]?.url || s.image?.[1]?.url || '',
          url: s.downloadUrl?.[4]?.url || s.downloadUrl?.[3]?.url || '',
        }));
        setResults(mappedResults);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const playFromResults = (song: Song, index: number) => {
    playSong(song, results, index);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Search</Text>
      
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#333" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="What do you want to listen to?"
          placeholderTextColor="#777"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => searchSongs(query)}
          returnKeyType="search"
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1DB954" style={{ marginTop: 50 }} />
      ) : isSearching ? (
        <FlatList 
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 140 }}
          renderItem={({ item, index }) => (
            <TouchableOpacity style={styles.listItem} onPress={() => playFromResults(item, index)}>
              <Image source={{ uri: item.artwork }} style={styles.listArt} />
              <View style={styles.listInfo}>
                <Text numberOfLines={1} style={styles.listTitle}>{item.title}</Text>
                <Text numberOfLines={1} style={styles.listArtist}>{item.artist}</Text>
              </View>
              <Ionicons name="play-circle" size={28} color="#1DB954" />
            </TouchableOpacity>
          )}
        />
      ) : (
        <>
          <Text style={styles.sectionLabel}>Browse all</Text>
          <FlatList 
            data={GENRES}
            numColumns={2}
            keyExtractor={item => item.name}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={[styles.genreCard, { backgroundColor: item.color }]}
                onPress={() => {
                  setQuery(item.name);
                  searchSongs(item.name);
                }}
              >
                <Text style={styles.genreText}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </>
      )}

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
    backgroundColor: '#121212', 
    paddingHorizontal: 20 
  },
  title: { 
    color: 'white', 
    fontSize: 32, 
    fontWeight: 'bold', 
    marginVertical: 20 
  },
  searchContainer: { 
    flexDirection: 'row', 
    backgroundColor: 'white', 
    paddingHorizontal: 15, 
    borderRadius: 8, 
    alignItems: 'center', 
    height: 50, 
    marginBottom: 30 
  },
  searchIcon: { marginRight: 10 },
  searchInput: { 
    flex: 1, 
    color: '#000', 
    fontSize: 16, 
    fontWeight: '600' 
  },
  sectionLabel: { 
    color: 'white', 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 15 
  },
  genreCard: { 
    flex: 1, 
    height: 100, 
    margin: 8, 
    borderRadius: 8, 
    padding: 15 
  },
  genreText: { 
    color: 'white', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  listItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 12, 
    borderBottomWidth: 0.5, 
    borderBottomColor: '#282828' 
  },
  listArt: { 
    width: 56, 
    height: 56, 
    borderRadius: 6, 
    marginRight: 14 
  },
  listInfo: { flex: 1 },
  listTitle: { 
    color: 'white', 
    fontSize: 15.5, 
    fontWeight: '600' 
  },
  listArtist: { 
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