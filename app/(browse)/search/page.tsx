import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import MovieCard from '@/components/shared/MovieCard';
import { searchMovies } from '@/lib/api';
import Link from 'next/link';
import CardViewMovie from '@/components/shared/CardViewMovie';
import SearchWithSuggestions from '@/components/shared/SearchWithSuggestions';

interface SearchPageProps {
  searchParams: {
    q?: string;
    page?: string;
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const keyword = searchParams.q || '';
  const page = parseInt(searchParams.page || '1');
  
  // Chỉ tìm kiếm khi có từ khóa
  const searchResults = keyword 
    ? await searchMovies(keyword, { page }) 
    : null;

  const totalPages = searchResults?.params.pagination.totalPages || 0;
  const imageDomain = searchResults?.APP_DOMAIN_CDN_IMAGE || '';

  return (
    <div className="min-h-screen bg-[#121212] pt-24">
      <div className="container mx-auto px-4">
        {/* Search Box */}
        <div className="mb-8">
          <div className="max-w-2xl mx-auto">
            <SearchWithSuggestions 
              placeholder="Tìm kiếm phim, chương trình TV..."
              className="w-full"
              autoFocus={true}
            />
          </div>
        </div>

        {keyword ? (
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-[#EAEAEA] mb-8">
              Kết quả tìm kiếm cho: <span className="text-[#FFD700]">&quot;{keyword}&quot;</span>
            </h1>
            
            {searchResults && searchResults.items.length === 0 ? (
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
                {searchResults && (
                    <CardViewMovie items={searchResults.items} imageDomain={imageDomain} />
                )}
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-12">
                    <div className="flex gap-2">
                      {page > 1 && (
                        <Link href={`/search?q=${keyword}&page=${page - 1}`}>
                          <Button 
                            variant="outline" 
                            className="border-[#2A2A2A] text-[#EAEAEA]"
                          >
                            Trang trước
                          </Button>
                        </Link>
                      )}
                      
                      <Button 
                        variant="outline" 
                        className="border-[#2A2A2A] bg-[#2A2A2A] text-[#EAEAEA]"
                      >
                        {page} / {totalPages}
                      </Button>
                      
                      {page < totalPages && (
                        <Link href={`/search?q=${keyword}&page=${page + 1}`}>
                          <Button 
                            variant="outline" 
                            className="border-[#2A2A2A] text-[#EAEAEA]"
                          >
                            Trang sau
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
            <div className="text-center py-12">
                <div className="mb-8">
                    <Search size={64} className="mx-auto text-[#FFD700] mb-4" />
                    <h1 className="text-3xl md:text-4xl font-bold text-[#EAEAEA] mb-4">Tìm kiếm phim</h1>
                    <p className="text-[#A0A0A0] text-lg mb-6">
                        Khám phá hàng ngàn bộ phim và chương trình TV
                    </p>
                </div>
                
                {/* Popular searches or trending */}
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-xl font-semibold text-[#EAEAEA] mb-4">Tìm kiếm phổ biến</h2>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {['Marvel', 'Avengers', 'Spider-Man', 'Batman', 'Anime', 'Hàn Quốc', 'Thái Lan', 'Hành động', 'Kinh dị', 'Tình cảm'].map((tag) => (
                            <Link
                                key={tag}
                                href={`/search?q=${encodeURIComponent(tag)}`}
                                className="px-4 py-2 bg-[#2A2A2A] hover:bg-[#FFD700] hover:text-[#121212] text-[#EAEAEA] rounded-full text-sm transition-all duration-200"
                            >
                                {tag}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}