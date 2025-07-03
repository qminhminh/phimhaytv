'use client';

import React from 'react';
import { 
    Eye, 
    BarChart3, 
    Clock, 
    Smartphone, 
    Monitor, 
    Tablet,
    Globe,
    TrendingUp,
    Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MovieStats as MovieStatsType } from '@/lib/api';

interface MovieStatsProps {
    stats: MovieStatsType;
}

export function MovieStats({ stats }: MovieStatsProps) {
    const formatNumber = (num: number) => {
        if (num >= 1000000) {
            return `${(num / 1000000).toFixed(1)}M`;
        } else if (num >= 1000) {
            return `${(num / 1000).toFixed(1)}K`;
        }
        return num.toString();
    };

    const deviceData = [
        { 
            name: 'Mobile', 
            percentage: stats.watchTimeDistribution.mobile, 
            icon: Smartphone, 
            color: 'text-green-400' 
        },
        { 
            name: 'Desktop', 
            percentage: stats.watchTimeDistribution.desktop, 
            icon: Monitor, 
            color: 'text-blue-400' 
        },
        { 
            name: 'Tablet', 
            percentage: stats.watchTimeDistribution.tablet, 
            icon: Tablet, 
            color: 'text-purple-400' 
        },
    ];

    const countryEntries = Object.entries(stats.viewsByCountry)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);

    return (
        <div className="space-y-6">
            {/* Thống kê tổng quan */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-blue-900/20 border-blue-700/50">
                    <CardContent className="p-4 text-center">
                        <div className="flex items-center justify-center mb-2">
                            <Eye className="w-6 h-6 text-blue-400" />
                        </div>
                        <div className="text-2xl font-bold text-blue-400">
                            {formatNumber(stats.totalViews)}
                        </div>
                        <p className="text-xs text-gray-400">Lượt xem</p>
                    </CardContent>
                </Card>

                <Card className="bg-green-900/20 border-green-700/50">
                    <CardContent className="p-4 text-center">
                        <div className="flex items-center justify-center mb-2">
                            <BarChart3 className="w-6 h-6 text-green-400" />
                        </div>
                        <div className="text-2xl font-bold text-green-400">
                            {stats.averageRating.toFixed(1)}
                        </div>
                        <p className="text-xs text-gray-400">Điểm trung bình</p>
                    </CardContent>
                </Card>

                <Card className="bg-purple-900/20 border-purple-700/50">
                    <CardContent className="p-4 text-center">
                        <div className="flex items-center justify-center mb-2">
                            <Users className="w-6 h-6 text-purple-400" />
                        </div>
                        <div className="text-2xl font-bold text-purple-400">
                            {formatNumber(stats.totalRatings)}
                        </div>
                        <p className="text-xs text-gray-400">Đánh giá</p>
                    </CardContent>
                </Card>

                <Card className="bg-orange-900/20 border-orange-700/50">
                    <CardContent className="p-4 text-center">
                        <div className="flex items-center justify-center mb-2">
                            <TrendingUp className="w-6 h-6 text-orange-400" />
                        </div>
                        <div className="text-2xl font-bold text-orange-400">
                            {stats.completionRate.toFixed(1)}%
                        </div>
                        <p className="text-xs text-gray-400">Hoàn thành</p>
                    </CardContent>
                </Card>
            </div>

            {/* Phân tích thiết bị */}
            <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Monitor className="w-5 h-5 text-blue-400" />
                        Phân tích thiết bị xem
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {deviceData.map(({ name, percentage, icon: Icon, color }) => (
                            <div key={name} className="flex items-center gap-3">
                                <Icon className={`w-5 h-5 ${color}`} />
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-gray-200 text-sm">{name}</span>
                                        <span className="text-gray-400 text-sm">{percentage}%</span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-2">
                                        <div 
                                            className={`h-2 rounded-full transition-all duration-500 ${
                                                color.includes('green') ? 'bg-green-400' :
                                                color.includes('blue') ? 'bg-blue-400' :
                                                'bg-purple-400'
                                            }`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Thống kê theo quốc gia */}
            <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Globe className="w-5 h-5 text-teal-400" />
                        Lượt xem theo quốc gia
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {countryEntries.map(([country, views], index) => {
                            const maxViews = Math.max(...Object.values(stats.viewsByCountry));
                            const percentage = (views / maxViews) * 100;
                            
                            return (
                                <div key={country} className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-medium">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-gray-200 text-sm">{country}</span>
                                            <span className="text-gray-400 text-sm">
                                                {formatNumber(views)} lượt xem
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-2">
                                            <div 
                                                className="bg-teal-400 h-2 rounded-full transition-all duration-500"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Giờ xem cao điểm */}
            <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Clock className="w-5 h-5 text-yellow-400" />
                        Giờ xem phổ biến
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-yellow-400 mb-2">
                            {stats.peakViewingHours.join('h - ')}h
                        </div>
                        <p className="text-gray-400 text-sm">
                            Thời gian khán giả xem nhiều nhất trong ngày
                        </p>
                        <div className="mt-4 text-xs text-gray-500">
                            Dựa trên phân tích dữ liệu 30 ngày gần nhất
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Lưu ý về dữ liệu */}
            <div className="text-center text-xs text-gray-500 bg-gray-900/30 p-3 rounded-lg">
                📊 Số liệu thống kê được cập nhật theo thời gian thực và phản ánh hành vi xem của người dùng PhimHayTV
            </div>
        </div>
    );
} 