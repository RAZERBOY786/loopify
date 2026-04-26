// components/MiniPlayer.tsx - Fixed & Spotify-like
import React from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  Pressable, 
  StyleSheet,
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlayer } from '../constants/player';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MiniPlayer() {
  const { currentSong, status, togglePlay } = usePlayer();
  const insets = useSafeAreaInsets();

  if (!currentSong) return null;

  return (
    <Pressable 
      style={[
        styles.miniPlayer, 
        { 
          paddingBottom: Platform.OS === 'ios' ? insets.bottom + 8 : 12 
        }
      ]} 
      onPress={() => console.log("Mini player tapped - Open full player here")}
    >
      <View style={styles.content}>
        <Image 
          source={{ uri: currentSong.artwork }} 
          style={styles.artwork} 
        />
        
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {currentSong.title}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {currentSong.artist}
          </Text>
        </View>

        <TouchableOpacity 
          onPress={togglePlay} 
          style={styles.playButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons 
            name={status.playing ? "pause" : "play"} 
            size={32} 
            color="#fff" 
          />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View 
          style={[
            styles.progress, 
            { 
              width: status.duration && status.duration > 0 
                ? `${(status.currentTime / status.duration) * 100}%` 
                : '0%' 
            }
          ]} 
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  miniPlayer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#282828',
    borderTopWidth: 1,
    borderTopColor: '#1DB954',
    zIndex: 1000,
    elevation: 10,           // For Android shadow/layering
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  artwork: {
    width: 52,
    height: 52,
    borderRadius: 4,
  },
  info: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 14.5,
    fontWeight: '600',
  },
  artist: {
    color: '#b3b3b3',
    fontSize: 12.5,
    marginTop: 2,
  },
  playButton: {
    padding: 8,
  },
  progressContainer: {
    height: 3,
    backgroundColor: '#404040',
    width: '100%',
  },
  progress: {
    height: '100%',
    backgroundColor: '#1DB954',
  },
});