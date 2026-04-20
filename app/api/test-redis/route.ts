import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

/**
 * API Route để kiểm tra kết nối Upstash Redis.
 * Sử dụng GET để ping thử.
 */
export async function GET() {
  try {
    // Thử ghi một giá trị kiểm tra
    const now = new Date().toISOString();
    await redis.set('test_connection', { message: 'Upstash Redis is working!', timestamp: now });

    // Đọc lại giá trị vừa ghi
    const data = await redis.get('test_connection');

    return NextResponse.json({
      success: true,
      message: 'Kết nối Upstash Redis thành công!',
      data
    });
  } catch (error: any) {
    console.error('Redis connection error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Lỗi kết nối Redis'
    }, { status: 500 });
  }
}
