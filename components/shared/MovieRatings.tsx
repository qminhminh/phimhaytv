'use client';

import React, { useState } from 'react';
import { Star, ThumbsUp, MessageCircle, Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { UserRating } from '@/lib/api';

interface MovieRatingsProps {
    movieSlug: string;
    averageRating: number;
    totalRatings: number;
    userRatings: UserRating[];
    featuredReviews: UserRating[];
}

export function MovieRatings({ 
    movieSlug, 
    averageRating, 
    totalRatings, 
    userRatings, 
    featuredReviews 
}: MovieRatingsProps) {
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [userReview, setUserReview] = useState('');
    const [userRating, setUserRating] = useState(0);

    // Tính toán phân phối đánh giá
    const ratingDistribution = Array.from({ length: 10 }, (_, i) => {
        const rating = i + 1;
        const count = userRatings.filter(r => Math.floor(r.rating) === rating).length;
        const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
        return { rating, count, percentage };
    }).reverse();

    const handleSubmitReview = () => {
        // Trong thực tế sẽ gửi lên server
        console.log('Submit review:', { userRating, userReview });
        setShowReviewForm(false);
        setUserReview('');
        setUserRating(0);
    };

    return (
        <div className="space-y-8">
            {/* Header với Rating tổng quan - Modern Design */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900/30 via-purple-900/30 to-pink-900/20 border border-indigo-500/20 backdrop-blur-sm">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,theme(colors.blue.500/20),transparent_50%)] pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,theme(colors.purple.500/15),transparent_50%)] pointer-events-none" />
                
                <div className="relative p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/25">
                                <Star className="w-6 h-6 text-white fill-current" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">
                                Đánh giá từ cộng đồng
                            </h2>
                        </div>
                        <p className="text-gray-300 text-lg">
                            Chia sẻ và khám phá ý kiến từ khán giả PhimHayTV
                        </p>
                    </div>

                    {/* Main Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* Rating Display */}
                        <div className="text-center space-y-6">
                            <div className="relative">
                                <div className="w-40 h-40 mx-auto rounded-full bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 p-1 shadow-2xl shadow-yellow-500/25">
                                    <div className="w-full h-full bg-gray-900 rounded-full flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="text-4xl font-black text-white mb-1">
                                                {averageRating.toFixed(1)}
                                            </div>
                                            <div className="text-sm text-gray-300 font-medium">
                                                / 10 điểm
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="flex justify-center space-x-1">
                                    {Array.from({ length: 5 }, (_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-7 h-7 transition-all duration-300 ${
                                                i < Math.floor(averageRating / 2) 
                                                    ? 'text-yellow-400 fill-current drop-shadow-lg' 
                                                    : 'text-gray-600'
                                            }`}
                                        />
                                    ))}
                                </div>
                                
                                <div className="space-y-1">
                                    <p className="text-white text-xl font-semibold">
                                        {totalRatings.toLocaleString()} lượt đánh giá
                                    </p>
                                    <p className="text-gray-400">
                                        Từ cộng đồng PhimHayTV
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Rating Distribution */}
                        <div className="space-y-4">
                            <h3 className="text-white text-xl font-semibold text-center lg:text-left">
                                Phân tích chi tiết
                            </h3>
                            <div className="space-y-3">
                                {ratingDistribution.map(({ rating, count, percentage }) => (
                                    <div key={rating} className="flex items-center gap-4">
                                        <div className="flex items-center gap-2 w-16">
                                            <span className="text-yellow-400 font-bold text-lg">{rating}</span>
                                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                        </div>
                                        
                                        <div className="flex-1 relative">
                                            <div className="h-4 bg-gray-800 rounded-full overflow-hidden shadow-inner">
                                                <div 
                                                    className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-1000 ease-out shadow-lg"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="w-12 text-right">
                                            <span className="text-gray-300 font-medium">
                                                {count}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* CTA Button */}
                    <div className="mt-10 text-center">
                        <Button 
                            onClick={() => setShowReviewForm(!showReviewForm)}
                            className="px-10 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold rounded-full transition-all duration-300 transform hover:scale-105 shadow-xl shadow-blue-500/25 text-lg"
                        >
                            <MessageCircle className="w-6 h-6 mr-3" />
                            {showReviewForm ? 'Đóng form đánh giá' : 'Chia sẻ đánh giá của bạn'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Review Form */}
            {showReviewForm && (
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900/95 to-gray-800/95 border border-gray-600/30 backdrop-blur-sm">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,theme(colors.blue.500/10),transparent_70%)] pointer-events-none" />
                    
                    <div className="relative p-8">
                        <div className="text-center mb-8">
                            <h3 className="text-2xl font-bold text-white mb-3">
                                Chia sẻ trải nghiệm của bạn
                            </h3>
                            <p className="text-gray-400">
                                Giúp cộng đồng có cái nhìn khách quan về bộ phim này
                            </p>
                        </div>

                        <div className="space-y-8">
                            {/* Rating Selector */}
                            <div>
                                <label className="block text-white text-lg font-semibold mb-4 text-center">
                                    Cho điểm từ 1 đến 10
                                </label>
                                <div className="flex gap-3 justify-center flex-wrap">
                                    {Array.from({ length: 10 }, (_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setUserRating(i + 1)}
                                            className={`w-14 h-14 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-110 ${
                                                i < userRating 
                                                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-xl shadow-yellow-500/40 scale-110' 
                                                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white shadow-lg'
                                            }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Review Text */}
                            <div>
                                <label className="block text-white text-lg font-semibold mb-4">
                                    Nhận xét chi tiết (tùy chọn)
                                </label>
                                <Textarea
                                    value={userReview}
                                    onChange={(e) => setUserReview(e.target.value)}
                                    placeholder="Chia sẻ cảm nhận, điểm hay, điểm chưa hay của bộ phim... Hãy viết một cách chân thật để giúp người khác!"
                                    rows={6}
                                    className="bg-gray-800/60 border-gray-600/50 text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-yellow-400/20 rounded-2xl text-lg p-4 backdrop-blur-sm"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4 justify-center">
                                <Button 
                                    onClick={handleSubmitReview} 
                                    disabled={userRating === 0}
                                    className="px-10 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-full transition-all duration-300 transform hover:scale-105 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg"
                                >
                                    <Star className="w-5 h-5 mr-2" />
                                    Gửi đánh giá
                                </Button>
                                <Button 
                                    variant="outline" 
                                    onClick={() => setShowReviewForm(false)}
                                    className="px-8 py-3 border-gray-500 text-gray-300 hover:bg-gray-700/50 hover:text-white rounded-full transition-all duration-300 text-lg"
                                >
                                    Hủy bỏ
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Featured Reviews */}
            {featuredReviews.length > 0 && (
                <Card className="border-green-500/20 bg-gradient-to-br from-green-900/20 to-emerald-900/20 backdrop-blur-sm rounded-2xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-b border-green-500/20">
                        <CardTitle className="text-white flex items-center gap-3 text-xl">
                            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            Đánh giá được biên tập viên chọn lọc
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        {featuredReviews.map((review) => (
                            <div 
                                key={review.id} 
                                className="p-6 bg-gray-900/30 rounded-2xl border border-gray-700/50 backdrop-blur-sm hover:bg-gray-900/50 transition-all duration-300"
                            >
                                <div className="flex items-start gap-4">
                                    <Avatar className="w-12 h-12 border-2 border-green-500/30">
                                        <AvatarFallback className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold">
                                            {review.userName.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <span className="font-bold text-white text-lg">
                                                {review.userName}
                                            </span>
                                            {review.isVerified && (
                                                <Badge className="bg-green-500/20 text-green-400 border-green-400/30">
                                                    ✓ Đã xác thực
                                                </Badge>
                                            )}
                                            <div className="flex items-center gap-2 bg-yellow-500/20 px-3 py-1 rounded-full">
                                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                                <span className="text-yellow-400 font-bold">
                                                    {review.rating}/10
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {review.review && (
                                            <p className="text-gray-200 leading-relaxed text-lg">
                                                {review.review}
                                            </p>
                                        )}
                                        
                                        <div className="flex items-center gap-6 text-sm text-gray-400">
                                            <span>{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                                            <button className="flex items-center gap-2 hover:text-green-400 transition-colors">
                                                <ThumbsUp className="w-4 h-4" />
                                                <span>{review.likes} hữu ích</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Notice */}
            <div className="flex items-start gap-3 p-6 bg-blue-900/30 border border-blue-600/30 rounded-2xl backdrop-blur-sm">
                <AlertTriangle className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                <div className="text-blue-200">
                    <p className="font-semibold mb-1">Lưu ý quan trọng</p>
                    <p className="text-sm leading-relaxed">
                        Tất cả đánh giá và bình luận đều được kiểm duyệt bởi đội ngũ PhimHayTV 
                        để đảm bảo chất lượng nội dung và tránh spoil cho người khác. 
                        Hãy chia sẻ một cách chân thật và có trách nhiệm!
                    </p>
                </div>
            </div>
        </div>
    );
} 