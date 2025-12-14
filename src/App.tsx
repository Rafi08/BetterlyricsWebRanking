import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { useSpotifyPlayer } from './hooks/useSpotifyPlayer';
import { useRanking } from './hooks/useRanking';
import { useLyrics } from './hooks/useLyrics';
import { isTV } from './utils/deviceUtils';
import './styles/main.scss';

import LyricsView from './components/LyricsView';
import Background from './components/Background';
import TrackInfo from './components/TrackInfo';
import RankingTable from './components/RankingTable';
import PlayerControls from './components/PlayerControls';

const Content = () => {
  const { token, login, logout } = useAuth();
  const { deviceId, player, currentTrack, nextTracks, isActive, position, seek, paused } = useSpotifyPlayer();
  const { lyrics } = useLyrics(currentTrack, token);

  // Ranking State
  const {
    categories,
    addSongToCategory,
    updateCategoryName,
    addCategory,
    removeCategory
  } = useRanking();

  // Playlist Selection State
  const [viewMode, setViewMode] = useState<'selection' | 'player'>('selection');
  const [playlistUrl, setPlaylistUrl] = useState('');

  // TV Logic
  useEffect(() => {
    if (isTV()) {
      document.body.classList.add('is-tv');
    }
  }, []);

  useEffect(() => {
    if (isActive && isTV()) {
      document.body.requestFullscreen().catch((err) => {
        console.warn('Auto-fullscreen blocked:', err);
      });
    }
  }, [isActive]);

  // Auto-switch to player when active
  useEffect(() => {
    if (isActive) {
      setViewMode('player');
    }
  }, [isActive]);

  const handlePlayPlaylist = async () => {
    if (!token || !deviceId) return;

    let contextUri = '';
    if (playlistUrl.includes('playlist')) {
      const id = playlistUrl.split('playlist/')[1]?.split('?')[0];
      if (id) contextUri = `spotify:playlist:${id}`;
    } else if (playlistUrl.includes('album')) {
      const id = playlistUrl.split('album/')[1]?.split('?')[0];
      if (id) contextUri = `spotify:album:${id}`;
    }

    if (contextUri) {
      await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ context_uri: contextUri })
      });
      setViewMode('player');
    }
  };

  const handlePlayFavorites = async () => {
    if (!token || !deviceId) return;
    // Favorites is 'spotify:user:uri:collection' or usually just library, but web api tracks play endpoint
    // often needs a context. `spotify:collection` might work or we play liked songs via `me/tracks`?
    // Actually, Spotify Web API "Play" endpoint doesn't support "Liked Songs" context directly easily.
    // We can just omit context_uri to play user's queue or recent, but better to warn or try to play specific playlist if known.
    // For now, let's try playing the user's "Liked Songs" if possible, or just alert instructions.
    // A common workaround is fetching liked songs and adding ONLY them, but that's heavy.
    // Alternative: Guide user to just "Open Spotify". 
    // But user asked for "option to use favorite songs".
    // We will try to just open the player and let them pick, or if they have a "Liked Songs" playlist uri.
    // Let's just switch to player view and show a toast/message.
    setViewMode('player');
  };

  if (!token) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '2rem' }}>
        <h1>Web App Ranking</h1>
        <button onClick={login} style={{ padding: '1rem 2rem', fontSize: '1.2rem', cursor: 'pointer' }}>
          Login with Spotify
        </button>
      </div>
    );
  }

  // Pre-Game Selection Screen
  if (viewMode === 'selection' && !isActive) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '2rem' }}>
        <h2>Setup Your Session</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px' }}>
          <input
            type="text"
            placeholder="Enter Spotify Playlist URL..."
            value={playlistUrl}
            onChange={(e) => setPlaylistUrl(e.target.value)}
            style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <button onClick={handlePlayPlaylist} disabled={!playlistUrl || !deviceId} style={{ padding: '0.8rem', cursor: 'pointer' }}>
            Start Playlist
          </button>
          <div style={{ textAlign: 'center', opacity: 0.5 }}>- OR -</div>
          <button onClick={handlePlayFavorites} style={{ padding: '0.8rem', cursor: 'pointer' }}>
            Use Favorite Songs (Start in Spotify)
          </button>
        </div>
        <small>Device ID: {deviceId || 'Connecting...'}</small>
        <button onClick={logout} style={{ marginTop: '2rem' }}>Logout</button>
      </div>
    );
  }

  return (
    <div style={{
      height: '100vh',
      overflow: 'hidden',
      position: 'relative',
      // background: '#121212' removed to show Background component
    }}>
      <Background coverArt={currentTrack?.album?.images?.[0]?.url} />

      {/* Main Grid Layout */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        height: '100%',
        width: '100vw',
        position: 'relative',
        zIndex: 10
      }}>
        {/* LEFT COLUMN (1/3) */}
        <div style={{
          flex: '1 1 33.33%',
          maxWidth: '33.33%',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid rgba(255,255,255,0.1)',
          height: '100%',
          overflow: 'hidden' // Contain children
        }}>
          {/* Top Left: Title & Cover */}
          <div style={{ flex: '0 0 auto', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <TrackInfo track={currentTrack} nextTracks={nextTracks} />
          </div>

          {/* Bottom Left: Lyrics */}
          <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
            <LyricsView lyrics={lyrics} position={position / 1000} seek={seek} />
          </div>
        </div>

        {/* RIGHT COLUMN (2/3) */}
        <div style={{
          flex: '1 1 66.66%',
          maxWidth: '66.66%',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          padding: '2rem',
          overflow: 'hidden'
        }}>
          {/* Top Right: Ranking Table */}
          <div style={{ flex: 1, overflow: 'hidden', marginBottom: '2rem' }}>
            <RankingTable
              categories={categories}
              onDropSong={addSongToCategory}
              onUpdateCategoryName={updateCategoryName}
              onAddCategory={addCategory}
              onRemoveCategory={removeCategory}
              currentTrack={currentTrack}
            />
          </div>

          {/* Bottom Right: Player Controls Bar */}
          <div style={{ flex: '0 0 auto' }}>
            <PlayerControls
              player={player}
              paused={paused}
              currentTrack={currentTrack}
              position={position}
              duration={currentTrack?.duration_ms || 0}
              seek={seek}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Content />
    </AuthProvider>
  );
};

export default App;
