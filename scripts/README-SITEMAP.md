# Hướng Dẫn Quản Lý Sitemap

## Tổng quan

Website sử dụng hệ thống sitemap phân tầng gồm:

1. **sitemap.xml** - Index sitemap chính (được Google đọc đầu tiên)
2. **sitemap-static.xml** - Các trang tĩnh quan trọng (trang chủ, danh mục)
3. **sitemap-movies-\*.xml** - URLs phim (CHỈ PHIM, KHÔNG CÓ TẬP PHIM)

**⚠️ LƯU Ý QUAN TRỌNG**: Sitemap đã được tối ưu hóa để chỉ tạo URLs cho phim (movies), không tạo URLs cho từng tập phim (episodes) để giảm tải và tăng tốc độ crawling.

## Cấu Hình Sitemap

- **Mỗi file sitemap**: Tối đa 3,500 URLs (thay vì 25,000)
- **Chia nhỏ file**: Tăng hiệu quả crawling và giảm thời gian tải
- **Chỉ movies**: Loại bỏ episodes để tập trung vào content chính

## Các Commands Quan Trọng

### Cập nhật thường ngày (khuyên dùng)
```bash
yarn sitemap:update
```
- Tạo lại sitemap tĩnh
- Cập nhật phim mới (chế độ incremental)
- Nhanh, ít tải API

### Tái tạo hoàn toàn sitemap 
```bash
yarn sitemap:full-rebuild
```
- Tạo lại tất cả sitemap từ đầu
- Chạy khi có vấn đề hoặc 1 tuần/lần
- Lâu, tải API nhiều

### Chỉ cập nhật trang tĩnh
```bash
yarn sitemap:static
```

### Sửa lỗi sitemap
```bash
yarn sitemap:fix
```
- Dọn dẹp file cũ
- Tái tạo hoàn toàn
- Validate kết quả

## Lịch Trình Khuyến Nghị

- **Hàng ngày**: `yarn sitemap:update` (automation)
- **Hàng tuần**: `yarn sitemap:full-rebuild` 
- **Khi có lỗi**: `yarn sitemap:fix`

## Tối Ưu Cho Google Search Console

### Điểm Quan Trọng

1. **sitemap-static.xml luôn được đặt đầu tiên** trong index
2. **Các trang tĩnh có priority cao** để Google index trước
3. **Sitemap được phân chia nhỏ** (3.5k URLs/file) để crawl hiệu quả hơn
4. **Tự động cập nhật lastmod** khi có thay đổi
5. **Chỉ focus vào movies** để Google hiểu rõ structure của site

### Cấu Trúc URL Patterns

- **Movies**: `/movies/{slug}` - Trang chi tiết phim
- **Static pages**: `/`, `/latest`, `/phim-le`, `/phim-bo`, etc.
- **⚠️ Không có**: `/watch/{movie_slug}/{episode_slug}` (episodes được exclude)

### Kiểm Tra Sitemap

1. Truy cập `https://phimhaytv.top/sitemap.xml`
2. Kiểm tra trong Google Search Console
3. Theo dõi số trang được discovered/indexed

## Xử Lý Sự Cố

### Vấn đề: "0 trang được khám phá"
- Chạy `yarn sitemap:fix`
- Kiểm tra robots.txt
- Resubmit sitemap trong Google Search Console

### Vấn đề: Sitemap quá lớn
- Sitemap tự động split khi > 3,500 URLs
- Đã tối ưu để chia nhỏ file, không cần thay đổi thêm

### Vấn đề: Lỗi network/API
- Script có auto-retry với exponential backoff
- Kiểm tra API endpoint phimapi.com

## Technical Notes

- Rate limiting: 200ms giữa các requests
- Concurrent limit: 10 requests cùng lúc
- Auto-retry với 429 errors
- URL validation trước khi thêm vào sitemap
- **Movies only**: Loại bỏ episodes để tăng tốc và tập trung SEO
- **File size**: 3.5k URLs/file thay vì 25k để tối ưu crawling 