import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import MovieCard from '@/components/shared/MovieCard';
import { searchMovies } from '@/lib/api';

interface SearchPageProps {
  searchParams: {
    keyword?: string;
    page?: string;
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const keyword = searchParams.keyword || '';
  const page = parseInt(searchParams.page || '1');
  
  // Chỉ tìm kiếm khi có từ khóa
  const searchResults = keyword 
    ? await searchMovies(keyword, { page }) 
    : { items: [], params: { pagination: { totalPages: 0, currentPage: 1 } } };

  return (
    <div className="min-h-screen bg-[#121212] pt-24">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl md:text-4xl font-bold text-[#EAEAEA] mb-8">
          Tìm Kiếm Phim
        </h1>
        
        {/* Search Form */}
        <form className="mb-12 max-w-2xl mx-auto" action="/search">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0A0]" />
              <Input 
                name="keyword"
                defaultValue={keyword}
                placeholder="Nhập tên phim cần tìm..." 
                className="pl-10 bg-[#1A1A1A] border-[#2A2A2A] text-[#EAEAEA] h-12"
              />
            </div>
            <Button 
              type="submit"
              className="bg-[#FFD700] hover:bg-[#FFD700]/90 text-[#121212] font-semibold h-12 px-6"
            >
              Tìm Kiếm
            </Button>
          </div>
        </form>
        
        {/* Search Results */}
        {keyword && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-[#EAEAEA] mb-4">
              Kết quả tìm kiếm cho: <span className="text-[#FFD700]">&quot;{keyword}&quot;</span>
            </h2>
            
            {searchResults.items.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[#A0A0A0] text-lg">
                  Không tìm thấy kết quả nào cho từ khóa &quot;{keyword}&quot;.
                </p>
                <p className="text-[#A0A0A0] mt-2">
                  Vui lòng thử lại với từ khóa khác.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                  {searchResults.items.map((movie) => (
                    <div key={movie._id}>
                      <MovieCard movie={movie} />
                    </div>
                  ))}
                </div>
                
                {/* Pagination */}
                {searchResults.params.pagination.totalPages > 1 && (
                  <div className="flex justify-center mt-12">
                    <div className="flex gap-2">
                      {page > 1 && (
                        <a href={`/search?keyword=${keyword}&page=${page - 1}`}>
                          <Button 
                            variant="outline" 
                            className="border-[#2A2A2A] text-[#EAEAEA]"
                          >
                            Trang trước
                          </Button>
                        </a>
                      )}
                      
                      <Button 
                        variant="outline" 
                        className="border-[#2A2A2A] bg-[#2A2A2A] text-[#EAEAEA]"
                      >
                        {page} / {searchResults.params.pagination.totalPages}
                      </Button>
                      
                      {page < searchResults.params.pagination.totalPages && (
                        <a href={`/search?keyword=${keyword}&page=${page + 1}`}>
                          <Button 
                            variant="outline" 
                            className="border-[#2A2A2A] text-[#EAEAEA]"
                          >
                            Trang sau
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}