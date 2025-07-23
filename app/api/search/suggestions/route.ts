import { NextRequest, NextResponse } from 'next/server';
import { getSuggestedMovies } from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('q') || '';

    if (!keyword.trim() || keyword.length < 2) {
      return NextResponse.json([]);
    }

    const suggestions = await getSuggestedMovies(keyword);
    return NextResponse.json(suggestions);
  } catch (error) {
    console.error('Error in search suggestions API:', error);
    return NextResponse.json([], { status: 500 });
  }
} 