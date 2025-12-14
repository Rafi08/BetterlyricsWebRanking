import React from 'react';

interface PlayerControlsProps {
    player: any; // Spotify Player object
    paused: boolean;
    currentTrack: any;
    position: number;
    duration: number;
    seek: (pos: number) => void;
}

const PlayerControls: React.FC<PlayerControlsProps> = ({
    player,
    paused,
    currentTrack,
    position,
    duration,
    seek
}) => {
    if (!player || !currentTrack) return null;

    const handleTogglePlay = () => {
        player.togglePlay();
    };

    const handleNext = () => {
        player.nextTrack();
    };

    const handlePrev = () => {
        player.previousTrack();
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPos = Number(e.target.value);
        seek(newPos);
    };

    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="PlayerControls" style={{
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            color: 'white',
            width: '100%'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{currentTrack.name}</span>
                    <span style={{ opacity: 0.7, fontSize: '0.9rem' }}>{currentTrack.artists[0].name}</span>
                </div>

                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <button
                        onClick={handlePrev}
                        style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.5rem' }}
                    >
                        ⏮
                    </button>
                    <button
                        onClick={handleTogglePlay}
                        style={{
                            background: 'white',
                            border: 'none',
                            color: 'black',
                            cursor: 'pointer',
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            fontSize: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        {paused ? '▶' : '⏸'}
                    </button>
                    <button
                        onClick={handleNext}
                        style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.5rem' }}
                    >
                        ⏭
                    </button>
                </div>

                <div style={{ width: '100px' }}></div> {/* Spacer for balance */}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
                <span style={{ fontSize: '0.8rem', minWidth: '40px' }}>{formatTime(position)}</span>
                <input
                    type="range"
                    min={0}
                    max={duration || 0}
                    value={position}
                    onChange={handleSeek}
                    style={{
                        flex: 1,
                        accentColor: 'white',
                        height: '4px',
                        cursor: 'pointer'
                    }}
                />
                <span style={{ fontSize: '0.8rem', minWidth: '40px' }}>{formatTime(duration)}</span>
            </div>
        </div>
    );
};

export default PlayerControls;
