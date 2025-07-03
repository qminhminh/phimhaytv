'use client';

import React from 'react';
import { 
    Play, 
    SkipForward, 
    Star, 
    Clock, 
    AlertTriangle, 
    Lightbulb,
    CheckCircle,
    XCircle,
    Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EnhancedMovieDetail } from '@/lib/api';

interface WatchGuideProps {
    movie: EnhancedMovieDetail;
    episodes?: any[];
}

export function WatchGuide({ movie, episodes }: WatchGuideProps) {
    const { watchGuide } = movie;
    
    if (!watchGuide) return null;

    return (
        <div className="space-y-6">
            {/* Hướng dẫn xem tổng quan */}
            <Card className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border-indigo-700/50">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Play className="w-5 h-5 text-indigo-400" />
                        Hướng dẫn xem phim từ PhimHayTV
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-200 leading-relaxed mb-4">
                        Để có trải nghiệm xem phim tốt nhất với <strong>{movie.name}</strong>, 
                        đội ngũ PhimHayTV gợi ý những điểm quan trọng sau:
                    </p>
                    
                    {watchGuide.viewingTips && (
                        <ul className="space-y-2">
                            {watchGuide.viewingTips.map((tip, index) => (
                                <li key={index} className="flex items-start gap-2 text-gray-300">
                                    <Lightbulb className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>

            {/* Thứ tự xem tốt nhất (cho series) */}
            {watchGuide.bestViewingOrder && watchGuide.bestViewingOrder.length > 0 && (
                <Card className="bg-green-900/20 border-green-700/50">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <SkipForward className="w-5 h-5 text-green-400" />
                            Thứ tự xem được khuyến nghị
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {watchGuide.bestViewingOrder.map((order, index) => (
                                <div key={index} className="flex items-center gap-3 p-3 bg-green-900/20 rounded-lg">
                                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                        {index + 1}
                                    </div>
                                    <span className="text-gray-200">{order}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Tập bắt buộc xem và có thể bỏ qua */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tập bắt buộc */}
                {watchGuide.mustWatchEpisodes && watchGuide.mustWatchEpisodes.length > 0 && (
                    <Card className="bg-red-900/20 border-red-700/50">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-red-400" />
                                Tập bắt buộc phải xem
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-300 text-sm mb-3">
                                Những tập này quan trọng cho cốt truyện chính:
                            </p>
                            <div className="space-y-2">
                                {watchGuide.mustWatchEpisodes.map((episode, index) => (
                                    <Badge 
                                        key={index} 
                                        variant="outline" 
                                        className="border-red-400 text-red-300 mr-2 mb-2"
                                    >
                                        {episode}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Tập có thể bỏ qua */}
                {watchGuide.skipableEpisodes && watchGuide.skipableEpisodes.length > 0 && (
                    <Card className="bg-gray-800/50 border-gray-600">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <XCircle className="w-5 h-5 text-gray-400" />
                                Tập có thể bỏ qua
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-300 text-sm mb-3">
                                Những tập này không ảnh hưởng nhiều đến cốt truyện chính:
                            </p>
                            <div className="space-y-2">
                                {watchGuide.skipableEpisodes.map((episode, index) => (
                                    <Badge 
                                        key={index} 
                                        variant="outline" 
                                        className="border-gray-400 text-gray-300 mr-2 mb-2"
                                    >
                                        {episode}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Thời gian xem ước tính */}
            <Card className="bg-blue-900/20 border-blue-700/50">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-400" />
                        Thời gian xem ước tính
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div className="p-3 bg-blue-900/20 rounded-lg">
                            <div className="text-2xl font-bold text-blue-400 mb-1">
                                {movie.time}
                            </div>
                            <p className="text-xs text-gray-400">Thời lượng</p>
                        </div>
                        
                        <div className="p-3 bg-blue-900/20 rounded-lg">
                            <div className="text-2xl font-bold text-blue-400 mb-1">
                                {episodes ? episodes.length : 1}
                            </div>
                            <p className="text-xs text-gray-400">Số tập</p>
                        </div>
                        
                        <div className="p-3 bg-blue-900/20 rounded-lg">
                            <div className="text-2xl font-bold text-blue-400 mb-1">
                                {movie.userStats.completionRate.toFixed(0)}%
                            </div>
                            <p className="text-xs text-gray-400">Tỷ lệ hoàn thành</p>
                        </div>
                        
                        <div className="p-3 bg-blue-900/20 rounded-lg">
                            <div className="text-2xl font-bold text-blue-400 mb-1">
                                {movie.userStats.peakViewingHours.join('-')}h
                            </div>
                            <p className="text-xs text-gray-400">Giờ vàng</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Mẹo xem phim từ cộng đồng */}
            <Card className="bg-yellow-900/20 border-yellow-700/50">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Users className="w-5 h-5 text-yellow-400" />
                        Mẹo từ cộng đồng PhimHayTV
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex items-start gap-2 text-gray-300">
                            <Star className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                            Hãy xem trong điều kiện ánh sáng tối để có trải nghiệm tốt nhất
                        </div>
                        <div className="flex items-start gap-2 text-gray-300">
                            <Star className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                            Sử dụng tai nghe để cảm nhận rõ âm thanh và nhạc phim
                        </div>
                        <div className="flex items-start gap-2 text-gray-300">
                            <Star className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                            Tắt thông báo điện thoại để tập trung vào nội dung
                        </div>
                        {movie.category.some(c => c.name.includes('Kinh Dị')) && (
                            <div className="flex items-start gap-2 text-red-300">
                                <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                                Đây là phim kinh dị - hãy chuẩn bị tinh thần!
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Lưu ý đặc biệt cho từng thể loại */}
            {movie.category.some(c => c.name.includes('Tài Liệu')) && (
                <Card className="bg-purple-900/20 border-purple-700/50">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-purple-400" />
                            Lưu ý đặc biệt cho phim tài liệu
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-300">
                            Đây là phim tài liệu - hãy dành thời gian suy ngẫm về những thông tin được trình bày. 
                            Bạn có thể tạm dừng để ghi chú những điểm quan trọng.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
} 