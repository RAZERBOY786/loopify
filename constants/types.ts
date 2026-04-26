export const Theme = {
  bg: '#000000',
  accent: '#1DB954', // Spotify Green
  text: '#FFFFFF',
  subText: '#B3B3B3',
};

export interface Song {
  id: string;
  title: string;
  artist: string;
  artwork: string;
  url: string;
  album?: string;
  duration?: number;
}