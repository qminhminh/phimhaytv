import { getLatestMovies } from '@/lib/api';
import MovieCard from '@/components/shared/MovieCard';
import { Pagination } from '@/components/ui/pagination';

interface LatestMoviesPageProps {
  searchParams: {
    page?: string;
  };
}

export const metadata = {
  title: 'Phim Mới Cập Nhật - PhimHayTV',
  description: 'Danh sách phim mới cập nhật trên PhimHayTV',
};

export default async function LatestMoviesPage({ searchParams }: LatestMoviesPageProps) {
  const currentPage = searchParams.page ? parseInt(searchParams.page) : 1;
  const latestMovies = await getLatestMovies(currentPage);
  
  // Lấy tổng số trang, mặc định là 1 nếu không có thông tin phân trang
  const totalPages = latestMovies.pagination?.totalPages || 
                    latestMovies.params?.pagination?.totalPages || 
                    1;
  
  return (
    <main className="min-h-screen bg-[#121212] py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-[#EAEAEA] mb-8">Phim Mới Cập Nhật</h1>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
          {latestMovies.items.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
        
        <div className="mt-8">
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            baseUrl="/latest" 
          />
        </div>
      </div>
    </main>
  );
} 