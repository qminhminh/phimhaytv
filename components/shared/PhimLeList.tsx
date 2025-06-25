import MovieCard from './MovieCard';
import { Movie } from '@/lib/api';

interface PhimLeListProps {
  items: Movie[];
  imageDomain: string;
}

export default function PhimLeList({ items, imageDomain }: PhimLeListProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {items.map((item) => (
        <MovieCard
          key={item._id}
          movie={item}
        />
      ))}
    </div>
  );
} 