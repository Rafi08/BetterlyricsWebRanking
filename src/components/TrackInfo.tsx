import React from 'react';

interface TrackInfoProps {
    track: any;
    nextTracks?: any[];
}

const TrackInfo: React.FC<TrackInfoProps> = ({ track, nextTracks }) => {
    if (!track) return null;

    const coverUrl = track.album?.images?.[0]?.url;
    const title = track.name;
    const artist = track.artists?.map((a: any) => a.name).join(', ');

    const nextTrack = nextTracks && nextTracks.length > 0 ? nextTracks[0] : null;

    return (
        <div className="TrackInfo" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '2rem',
            textAlign: 'center',
            position: 'relative', // Fix absolute child positioning
            zIndex: 10,
            color: 'white',
            width: '100%',
        }}>
            {coverUrl && (
                <img
                    src={coverUrl}
                    alt="Album Art"
                    draggable={true}
                    onDragStart={(e) => {
                        const songData = {
                            id: track.id,
                            name: title,
                            artist: artist,
                            cover: coverUrl,
                            timestamp: Date.now()
                        };
                        e.dataTransfer.setData('application/json', JSON.stringify(songData));
                        e.dataTransfer.effectAllowed = 'copy';
                    }}
                    style={{
                        width: '100%',
                        maxWidth: '350px', // Reduce max width for 1/3 col
                        borderRadius: '12px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                        marginBottom: '1rem', // Reduced margin
                        cursor: 'grab',
                        aspectRatio: '1/1',
                        objectFit: 'cover'
                    }}
                />
            )}
            <h1 style={{ fontSize: '2rem', margin: '0 0 0.25rem 0', fontWeight: 'bold' }}>{title}</h1>
            <h2 style={{ fontSize: '1.2rem', margin: 0, opacity: 0.8, fontWeight: 'normal' }}>{artist}</h2>

            {/* Next Track Info: Position relative to THIS container */}
            {nextTrack && (
                <div style={{
                    marginTop: '1rem',
                    opacity: 0.6,
                    transform: 'scale(0.8)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.2rem'
                }}>
                    <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Up Next: {nextTrack.name}</span>
                </div>
            )}
        </div>
    );
};

export default TrackInfo;
