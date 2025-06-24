import React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  currentPage: number
  totalPages: number
  onPageChange?: (page: number) => void
  baseUrl?: string
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  baseUrl,
  className,
  ...props
}: PaginationProps) {
  // Tính toán các trang sẽ hiển thị
  const generatePages = () => {
    // Luôn hiển thị trang đầu, trang cuối, trang hiện tại và 1 trang trước/sau trang hiện tại
    const pages = new Set<number>()
    pages.add(1) // Trang đầu
    pages.add(totalPages) // Trang cuối
    
    // Trang hiện tại và các trang xung quanh
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.add(i)
    }
    
    // Chuyển thành mảng và sắp xếp
    return Array.from(pages).sort((a, b) => a - b)
  }

  const pages = generatePages()
  
  // Tạo các phần tử phân trang
  const renderPageItems = () => {
    const items: React.ReactNode[] = []
    
    pages.forEach((page, index) => {
      // Thêm dấu "..." nếu có khoảng cách giữa các trang
      if (index > 0 && pages[index] - pages[index - 1] > 1) {
        items.push(
          <div key={`ellipsis-${index}`} className="flex items-center justify-center">
            <MoreHorizontal className="h-4 w-4 text-[#A0A0A0]" />
          </div>
        )
      }
      
      // Thêm nút trang
      items.push(
        baseUrl ? (
          <Link
            key={page}
            href={`${baseUrl}${page === 1 ? "" : `?page=${page}`}`}
            className={cn(
              "pagination-item",
              currentPage === page ? "active" : ""
            )}
          >
            {page}
          </Link>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange?.(page)}
            className={cn(
              "pagination-item",
              currentPage === page ? "active" : ""
            )}
            disabled={currentPage === page}
          >
            {page}
          </button>
        )
      )
    })
    
    return items
  }

  // Xử lý nút Previous
  const prevPage = currentPage > 1 ? currentPage - 1 : null
  
  // Xử lý nút Next
  const nextPage = currentPage < totalPages ? currentPage + 1 : null

  return (
    <nav
      role="navigation"
      aria-label="Phân trang"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    >
      <div className="flex items-center space-x-2">
        {/* Nút Previous */}
        {baseUrl ? (
          <Link
            href={prevPage ? `${baseUrl}${prevPage === 1 ? "" : `?page=${prevPage}`}` : "#"}
            className={cn(
              "pagination-nav",
              !prevPage && "pointer-events-none opacity-50"
            )}
            aria-disabled={!prevPage}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span>Trước</span>
          </Link>
        ) : (
          <button
            onClick={() => prevPage && onPageChange?.(prevPage)}
            className="pagination-nav"
            disabled={!prevPage}
            aria-disabled={!prevPage}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span>Trước</span>
          </button>
        )}
        
        {/* Các trang */}
        {renderPageItems()}
        
        {/* Nút Next */}
        {baseUrl ? (
          <Link
            href={nextPage ? `${baseUrl}?page=${nextPage}` : "#"}
            className={cn(
              "pagination-nav",
              !nextPage && "pointer-events-none opacity-50"
            )}
            aria-disabled={!nextPage}
          >
            <span>Tiếp</span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        ) : (
          <button
            onClick={() => nextPage && onPageChange?.(nextPage)}
            className="pagination-nav"
            disabled={!nextPage}
            aria-disabled={!nextPage}
          >
            <span>Tiếp</span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        )}
      </div>
    </nav>
  )
}
