'use client';

import { PlayCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface PlayMovieButtonProps {
    movieId: string;
    movieSlug: string;
    firstEpisodeSlug: string;
    className?: string;
}

export function PlayMovieButton({ movieId, movieSlug, firstEpisodeSlug, className }: PlayMovieButtonProps) {
    const [resumeData, setResumeData] = useState<{link: string, text: string} | null>(null);

    useEffect(() => {
        try {
            const lastEpisodeSlug = localStorage.getItem(`movie-latest-episode-${movieId}`);
            if (lastEpisodeSlug) {
                const progressKey = `movie-progress-${movieId}-${lastEpisodeSlug}`;
                const progressRaw = localStorage.getItem(progressKey);
                if (progressRaw) {
                    const { currentTime } = JSON.parse(progressRaw);
                    if (currentTime > 5) {
                        setResumeData({ 
                            link: `/watch/${movieSlug}/${lastEpisodeSlug}`, 
                            text: 'Xem Tiếp' 
                        });
                    }
                }
            }
        } catch (error) {
            console.error("Failed to parse progress", error);
        }
    }, [movieId, movieSlug]);

    const href = resumeData ? resumeData.link : `/watch/${movieSlug}/${firstEpisodeSlug}`;
    const text = resumeData ? resumeData.text : 'Xem Ngay';

    return (
        <Link href={href} className={className}>
            <PlayCircle size={24} />
            <span>{text}</span>
        </Link>
    );
}
