import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Animated, Dimensions, Modal, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudio } from '../constants/AudioContext';

const { width } = Dimensions.get('window');

export default function GlobalPlayer() {
  const { 
    status, currentSong, isPlayerVisible, setIsPlayerVisible, 
    rotationAnim, togglePlay, playNext, playPrevious 
  } = useAudio();

  if (!currentSong) return null;

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <>
      {/* MINI PLAYER */}
      {!isPlayerVisible && (
        <TouchableOpacity 
          style={styles.miniPlayer} 
          onPress={() => setIsPlayerVisible(true)} 
          activeOpacity={0.9}
        >
          <Image source={{ uri: currentSong.artwork }} style={styles.miniArt} />
          <View style={styles.miniInfo}>
            <Text numberOfLines={1} style={styles.miniTitle}>{currentSong.title}</Text>
            <Text numberOfLines={1} style={styles.miniArtist}>{currentSong.artist}</Text>
          </View>
          <TouchableOpacity onPress={togglePlay}>
            <Ionicons name={status.playing ? 'pause-circle' : 'play-circle'} size={42} color="#1DB954" />
          </TouchableOpacity>
        </TouchableOpacity>
      )}

      {/* FULL PLAYER */}
      <Modal visible={isPlayerVisible} transparent animationType="slide" onRequestClose={() => setIsPlayerVisible(false)}>
        <View style={styles.fullPlayerContainer}>
          <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.fullPlayerHeader}>
              <TouchableOpacity onPress={() => setIsPlayerVisible(false)}>
                <Ionicons name="chevron-down" size={32} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.nowPlaying}>Now Playing</Text>
              <View style={{ width: 32 }} />
            </View>

            <View style={styles.artContainer}>
              <Animated.View style={[styles.artWrapper, {
                transform: [{ rotate: rotationAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }]
              }]}>
                <Image source={{ uri: currentSong.artwork }} style={styles.fullArt} />
              </Animated.View>
            </View>

            <View style={styles.songInfo}>
              <Text numberOfLines={1} style={styles.fullTitle}>{currentSong.title}</Text>
              <Text numberOfLines={1} style={styles.fullArtist}>{currentSong.artist}</Text>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progress, { width: `${(status.currentTime / Math.max(status.duration || 1, 1)) * 100}%` }]} />
              </View>
              <View style={styles.timeContainer}>
                <Text style={styles.timeText}>{formatTime(status.currentTime)}</Text>
                <Text style={styles.timeText}>{formatTime(status.duration)}</Text>
              </View>
            </View>

            <View style={styles.controls}>
              <Ionicons name="shuffle" size={28} color="#b3b3b3" />
              <TouchableOpacity onPress={playPrevious}><Ionicons name="play-skip-back" size={42} color="#fff" /></TouchableOpacity>
              <TouchableOpacity onPress={togglePlay}><Ionicons name={status.playing ? "pause-circle" : "play-circle"} size={72} color="#1DB954" /></TouchableOpacity>
              <TouchableOpacity onPress={playNext}><Ionicons name="play-skip-forward" size={42} color="#fff" /></TouchableOpacity>
              <Ionicons name="repeat" size={28} color="#b3b3b3" />
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  miniPlayer: { position: 'absolute', bottom: 80, left: 10, right: 10, height: 66, backgroundColor: '#282828', borderRadius: 10, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, elevation: 5 },
  miniArt: { width: 52, height: 52, borderRadius: 6 },
  miniInfo: { flex: 1, marginLeft: 12 },
  miniTitle: { color: 'white', fontWeight: '600', fontSize: 14 },
  miniArtist: { color: '#b3b3b3', fontSize: 12.5 },
  fullPlayerContainer: { flex: 1, backgroundColor: '#121212' },
  fullPlayerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  nowPlaying: { color: '#fff', fontSize: 16, fontWeight: '600' },
  artContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  artWrapper: { width: width * 0.78, height: width * 0.78, borderRadius: width * 0.39, overflow: 'hidden', borderWidth: 12, borderColor: '#282828' },
  fullArt: { width: '100%', height: '100%' },
  songInfo: { alignItems: 'center', paddingHorizontal: 30, marginBottom: 30 },
  fullTitle: { color: 'white', fontSize: 26, fontWeight: '700', textAlign: 'center' },
  fullArtist: { color: '#b3b3b3', fontSize: 18, marginTop: 8, textAlign: 'center' },
  progressContainer: { paddingHorizontal: 30, marginBottom: 40 },
  progressBar: { height: 4, backgroundColor: '#404040', borderRadius: 2 },
  progress: { height: '100%', backgroundColor: '#1DB954' },
  timeContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  timeText: { color: '#b3b3b3', fontSize: 13 },
  controls: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingBottom: 50 }
});