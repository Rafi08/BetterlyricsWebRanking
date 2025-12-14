import React, { useState } from 'react';
import type { Category, RankedSong } from '../hooks/useRanking';
import { motion, AnimatePresence } from 'framer-motion';

interface RankingTableProps {
    categories: Category[];
    onDropSong: (categoryId: string, song: RankedSong) => void;
    onUpdateCategoryName: (categoryId: string, newName: string) => void;
    onAddCategory: () => void;
    onRemoveCategory: (categoryId: string) => void;
    reorderSongs: (categoryId: string, startIndex: number, endIndex: number) => void;
    currentTrack: any; // Passed for dragging context if needed
}

const RankingTable: React.FC<RankingTableProps> = ({
    categories,
    onDropSong,
    onUpdateCategoryName,
    onAddCategory,
    onRemoveCategory,
    reorderSongs
}) => {
    const [dragOverCategory, setDragOverCategory] = useState<string | null>(null);

    const handleDragOver = (e: React.DragEvent, categoryId: string) => {
        e.preventDefault();
        setDragOverCategory(categoryId);
    };

    const handleDragLeave = () => {
        setDragOverCategory(null);
    };

    const handleDrop = (e: React.DragEvent, categoryId: string) => {
        e.preventDefault();
        setDragOverCategory(null);
        try {
            const songData = JSON.parse(e.dataTransfer.getData('application/json'));
            if (songData && songData.id) {
                onDropSong(categoryId, songData);
            }
        } catch (err) {
            console.error('Failed to parse dropped song data', err);
        }
    };

    return (
        <div className="RankingTable" style={{
            height: '100%',
            overflowY: 'auto',
            padding: '2rem',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '16px',
            backdropFilter: 'blur(10px)',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Rankings</h2>
                <button
                    onClick={onAddCategory}
                    style={{
                        padding: '0.5rem 1rem',
                        background: 'rgba(255,255,255,0.1)',
                        border: 'none',
                        color: 'white',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    + Add Category
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {categories.map((category) => (
                    <div
                        key={category.id}
                        onDragOver={(e) => handleDragOver(e, category.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, category.id)}
                        style={{
                            background: dragOverCategory === category.id
                                ? 'rgba(255,255,255,0.2)'
                                : 'rgba(0,0,0,0.2)',
                            borderRadius: '8px',
                            padding: '1rem',
                            border: '1px solid rgba(255,255,255,0.1)',
                            transition: 'background 0.2s'
                        }}
                    >
                        <div style={{ marginBottom: '0.8rem', display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                value={category.name}
                                onChange={(e) => onUpdateCategoryName(category.id, e.target.value)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'white',
                                    fontSize: '1.2rem',
                                    fontWeight: 'bold',
                                    flex: 1,
                                    outline: 'none'
                                }}
                            />
                            <button
                                onClick={() => onRemoveCategory(category.id)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'rgba(255,255,255,0.5)',
                                    cursor: 'pointer',
                                    fontSize: '1.2rem',
                                    padding: '0 0.5rem'
                                }}
                                title="Remove Category"
                            >
                                ×
                            </button>
                        </div>

                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '0.5rem',
                            minHeight: '60px' // Drop target height
                        }}>
                            <AnimatePresence>
                                {category.songs.map((song) => (
                                    <motion.div
                                        key={song.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.5 }}
                                        title={`${song.name} - ${song.artist}`}
                                        draggable
                                        onDragStart={(e) => {
                                            const event = e as unknown as React.DragEvent<HTMLDivElement>;
                                            event.dataTransfer.setData('reorder/json', JSON.stringify({
                                                categoryId: category.id,
                                                index: category.songs.indexOf(song)
                                            }));
                                            event.dataTransfer.effectAllowed = 'move';
                                        }}
                                        onDragOver={(e) => {
                                            e.preventDefault(); // Allow drop
                                        }}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation(); // Prevent category drop logic

                                            const event = e as unknown as React.DragEvent<HTMLDivElement>;
                                            try {
                                                const reorderData = event.dataTransfer.getData('reorder/json');
                                                if (reorderData) {
                                                    const { categoryId: srcCatId, index: srcIndex } = JSON.parse(reorderData);

                                                    // Only allow reordering within the same category for now (simplifies UX)
                                                    if (srcCatId === category.id) {
                                                        const targetIndex = category.songs.indexOf(song);
                                                        if (srcIndex !== targetIndex) {
                                                            reorderSongs(category.id, srcIndex, targetIndex);
                                                        }
                                                    }
                                                }
                                            } catch (err) {
                                                // Ignore if not reorder data
                                            }
                                        }}
                                        style={{
                                            width: '50px',
                                            height: '50px',
                                            borderRadius: '4px',
                                            overflow: 'hidden',
                                            position: 'relative',
                                            cursor: 'grab'
                                        }}
                                    >
                                        <img
                                            src={song.cover}
                                            alt={song.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
                                        />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {category.songs.length === 0 && (
                                <div style={{
                                    opacity: 0.3,
                                    display: 'flex',
                                    alignItems: 'center',
                                    width: '100%',
                                    fontSize: '0.9rem',
                                    fontStyle: 'italic'
                                }}>
                                    Drop songs here...
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RankingTable;
