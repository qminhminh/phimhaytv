# Hướng Dẫn Quản Lý Sitemap

## Tổng quan

Website sử dụng hệ thống sitemap phân tầng gồm:

1. **sitemap.xml** - Index sitemap chính (được Google đọc đầu tiên)
2. **sitemap-static.xml** - Các trang tĩnh quan trọng (trang chủ, danh mục)
3. **sitemap-movies-\*.xml** - URLs phim
4. **sitemap-episodes-\*.xml** - URLs tập phim

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
3. **Sitemap được phân chia** để tránh quá 50MB/file
4. **Tự động cập nhật lastmod** khi có thay đổi

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
- Sitemap tự động split khi > 25000 URLs
- Nếu vẫn lớn, giảm SITEMAP_MAX_URLS trong script

### Vấn đề: Lỗi network/API
- Script có auto-retry với exponential backoff
- Kiểm tra API endpoint phimapi.com

## Technical Notes

- Rate limiting: 200ms giữa các requests
- Concurrent limit: 10 requests cùng lúc
- Auto-retry với 429 errors
- URL validation trước khi thêm vào sitemap 