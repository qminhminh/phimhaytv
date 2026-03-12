import React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  currentPage: number
  totalPages: number
  baseUrl: string // baseUrl is required for server-side pagination
}

export function Pagination({
  currentPage,
  totalPages,
  baseUrl,
  className,
  ...props
}: PaginationProps) {
  const createPageUrl = (page: number) => {
    const [path, queryString] = baseUrl.split('?');
    const params = new URLSearchParams(queryString);
    if (page > 1) {
      params.set('page', page.toString());
    } else {
      params.delete('page');
    }
    const newQueryString = params.toString();
    return newQueryString ? `${path}?${newQueryString}` : path;
  };

  // Tính toán các trang sẽ hiển thị
  const generatePages = () => {
    const pages = new Set<number>()
    pages.add(1)
    pages.add(totalPages)
    
    for (let i = Math.max(2, currentPage - 2); i <= Math.min(totalPages - 1, currentPage + 2); i++) {
      pages.add(i)
    }
    
    return Array.from(pages).sort((a, b) => a - b)
  }

  const pages = generatePages()
  
  const renderPageItems = () => {
    const items: React.ReactNode[] = []
    let lastPage = 0
    
    pages.forEach((page, index) => {
      if (lastPage > 0 && page - lastPage > 1) {
        items.push(
          <div key={`ellipsis-${lastPage}`} className="flex items-center justify-center w-10 h-10">
            <MoreHorizontal className="h-4 w-4 text-gray-400" />
          </div>
        )
      }
      
      items.push(
        <Link
          key={page}
          href={createPageUrl(page)}
          prefetch={false}
          className={cn(
            "w-10 h-10 flex items-center justify-center rounded-md text-sm font-medium transition-colors",
            currentPage === page 
              ? "bg-yellow-500 text-black hover:bg-yellow-600 pointer-events-none" 
              : "bg-neutral-800 text-gray-200 hover:bg-neutral-700"
          )}
          aria-current={currentPage === page ? 'page' : undefined}
        >
          {page}
        </Link>
      )
      lastPage = page;
    })
    
    return items
  }

  const prevPage = currentPage > 1 ? currentPage - 1 : null
  const nextPage = currentPage < totalPages ? currentPage + 1 : null

  return (
    <nav
      role="navigation"
      aria-label="Phân trang"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    >
      <div className="flex items-center space-x-2">
        <Link
          href={prevPage ? createPageUrl(prevPage) : "#"}
          prefetch={false}
          className={cn(
            "flex items-center px-3 h-10 rounded-md text-sm font-medium transition-colors",
            "bg-neutral-800 text-gray-200 hover:bg-neutral-700",
            !prevPage && "pointer-events-none opacity-50"
          )}
          aria-disabled={!prevPage}
          tabIndex={!prevPage ? -1 : undefined}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          <span>Trước</span>
        </Link>
        
        {renderPageItems()}
        
        <Link
          href={nextPage ? createPageUrl(nextPage) : "#"}
          prefetch={false}
          className={cn(
            "flex items-center px-3 h-10 rounded-md text-sm font-medium transition-colors",
            "bg-neutral-800 text-gray-200 hover:bg-neutral-700",
            !nextPage && "pointer-events-none opacity-50"
          )}
          aria-disabled={!nextPage}
          tabIndex={!nextPage ? -1 : undefined}
        >
          <span>Tiếp</span>
          <ChevronRight className="h-4 w-4 ml-1" />
        </Link>
      </div>
    </nav>
  )
}
