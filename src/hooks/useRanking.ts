import { useState, useEffect } from 'react';

export interface RankedSong {
    id: string;
    name: string;
    artist: string;
    cover: string;
    timestamp: number;
}

export interface Category {
    id: string;
    name: string;
    songs: RankedSong[];
}

const DEFAULT_CATEGORIES: Category[] = [
    { id: 'S', name: 'S Tier', songs: [] },
    { id: 'A', name: 'A Tier', songs: [] },
    { id: 'B', name: 'B Tier', songs: [] },
    { id: 'C', name: 'C Tier', songs: [] },
    { id: 'D', name: 'D Tier', songs: [] },
];

export const useRanking = () => {
    const [categories, setCategories] = useState<Category[]>(() => {
        const saved = localStorage.getItem('ranking_categories');
        return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
    });

    useEffect(() => {
        localStorage.setItem('ranking_categories', JSON.stringify(categories));
    }, [categories]);

    const addSongToCategory = (categoryId: string, song: RankedSong) => {
        setCategories(prev => prev.map(cat => {
            // Remove song from other categories first to avoid duplicates
            const cleanSongs = cat.songs.filter(s => s.id !== song.id);
            if (cat.id === categoryId) {
                return { ...cat, songs: [song, ...cleanSongs] };
            }
            return { ...cat, songs: cleanSongs };
        }));
    };

    const updateCategoryName = (categoryId: string, newName: string) => {
        setCategories(prev => prev.map(cat =>
            cat.id === categoryId ? { ...cat, name: newName } : cat
        ));
    };

    const addCategory = () => {
        const newId = `cat-${Date.now()}`;
        setCategories(prev => [...prev, { id: newId, name: 'New Tier', songs: [] }]);
    };

    const removeCategory = (categoryId: string) => {
        setCategories(prev => prev.filter(c => c.id !== categoryId));
    };

    const reorderSongs = (categoryId: string, startIndex: number, endIndex: number) => {
        setCategories(prev => prev.map(cat => {
            if (cat.id !== categoryId) return cat;

            const newSongs = Array.from(cat.songs);
            const [reorderedItem] = newSongs.splice(startIndex, 1);
            newSongs.splice(endIndex, 0, reorderedItem);

            return { ...cat, songs: newSongs };
        }));
    };

    return {
        categories,
        addSongToCategory,
        updateCategoryName,
        addCategory,
        removeCategory,
        reorderSongs
    };
};
