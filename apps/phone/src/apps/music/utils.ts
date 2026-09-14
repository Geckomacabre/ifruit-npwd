import { MusicState } from '@typings/music';

// Browser-preview stand-in; fetchNui only returns it outside the game.
export const BrowserMusic: MusicState = {
  tracks: [
    { id: 3, title: 'Night Drive', url: 'https://example.com/night-drive.mp3' },
    { id: 2, title: 'Vinewood Nights', url: 'https://example.com/vinewood.mp3' },
    { id: 1, title: 'Del Perro Sunset', url: 'https://example.com/delperro.mp3' },
  ],
  current: { id: 3, title: 'Night Drive', url: 'https://example.com/night-drive.mp3', mode: 'earbuds', volume: 0.5, paused: false },
};
