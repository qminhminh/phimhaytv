'use client';

import React, { useState } from 'react';
import { 
    BookOpen, 
    Target, 
    AlertCircle, 
    Globe, 
    Lightbulb, 
    Camera,
    ThumbsUp,
    ThumbsDown,
    Users,
    Zap,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { MovieAnalysis as MovieAnalysisType, EditorialContent } from '@/lib/api';

interface MovieAnalysisProps {
    analysis: MovieAnalysisType;
    editorialContent?: EditorialContent;
    uniqueDescription: string;
}

export function MovieAnalysis({ analysis, editorialContent, uniqueDescription }: MovieAnalysisProps) {
    const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
    const [isTriviaOpen, setIsTriviaOpen] = useState(false);

    return (
        <div className="space-y-6">
            {/* Mô tả độc đáo từ biên tập viên */}
            <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-700/50">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-purple-400" />
                        Nhận định của PhimHayTV
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-200 leading-relaxed">
                        {uniqueDescription}
                    </p>
                </CardContent>
            </Card>

            {/* Tóm tắt cốt truyện không spoil */}
            <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-400" />
                        Tóm tắt nội dung (Không spoil)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-300 leading-relaxed">
                        {analysis.plotSummary}
                    </p>
                </CardContent>
            </Card>

            {/* Điểm mạnh và điểm yếu */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-green-900/20 border-green-700/50">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <ThumbsUp className="w-5 h-5 text-green-400" />
                            Điểm mạnh
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {analysis.strengths.map((strength, index) => (
                                <li key={index} className="flex items-start gap-2 text-gray-200">
                                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                                    {strength}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                <Card className="bg-orange-900/20 border-orange-700/50">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <ThumbsDown className="w-5 h-5 text-orange-400" />
                            Điểm cần cải thiện
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {analysis.weaknesses.map((weakness, index) => (
                                <li key={index} className="flex items-start gap-2 text-gray-200">
                                    <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0" />
                                    {weakness}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>

            {/* Phù hợp với đối tượng nào */}
            <Card className="bg-blue-900/20 border-blue-700/50">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-400" />
                        Phù hợp với
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {analysis.bestFor.map((audience, index) => (
                            <Badge 
                                key={index} 
                                variant="outline" 
                                className="border-blue-400 text-blue-300"
                            >
                                {audience}
                            </Badge>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Cảnh báo nội dung */}
            {analysis.contentWarnings.length > 0 && (
                <Card className="bg-red-900/20 border-red-700/50">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-red-400" />
                            Cảnh báo nội dung
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {analysis.contentWarnings.map((warning, index) => (
                                <li key={index} className="flex items-start gap-2 text-red-200">
                                    <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                                    {warning}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            {/* Bối cảnh văn hóa */}
            {analysis.culturalContext && (
                <Card className="bg-teal-900/20 border-teal-700/50">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Globe className="w-5 h-5 text-teal-400" />
                            Bối cảnh văn hóa
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-200 leading-relaxed">
                            {analysis.culturalContext}
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Phân tích chi tiết có thể thu gọn */}
            <Collapsible open={isAnalysisOpen} onOpenChange={setIsAnalysisOpen}>
                <Card className="bg-gray-800/50 border-gray-700">
                    <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-gray-700/30 transition-colors">
                            <CardTitle className="text-white flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Target className="w-5 h-5 text-purple-400" />
                                    Phân tích chuyên sâu
                                </div>
                                {isAnalysisOpen ? (
                                    <ChevronUp className="w-5 h-5" />
                                ) : (
                                    <ChevronDown className="w-5 h-5" />
                                )}
                            </CardTitle>
                        </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <CardContent className="pt-0">
                            {editorialContent ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                        <span>Tác giả: {editorialContent.author}</span>
                                        <span>•</span>
                                        <span>{editorialContent.readingTime} phút đọc</span>
                                        <span>•</span>
                                        <span>{new Date(editorialContent.publishedAt).toLocaleDateString('vi-VN')}</span>
                                    </div>
                                    
                                    <div 
                                        className="prose prose-invert max-w-none text-gray-200"
                                        dangerouslySetInnerHTML={{ __html: editorialContent.content }}
                                    />
                                    
                                    <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-700">
                                        {editorialContent.tags.map((tag, index) => (
                                            <Badge key={index} variant="secondary" className="text-xs">
                                                #{tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-400 italic">
                                    Nội dung phân tích chuyên sâu đang được cập nhật...
                                </p>
                            )}
                        </CardContent>
                    </CollapsibleContent>
                </Card>
            </Collapsible>

            {/* Trivia và Behind the scenes */}
            <Collapsible open={isTriviaOpen} onOpenChange={setIsTriviaOpen}>
                <Card className="bg-gray-800/50 border-gray-700">
                    <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-gray-700/30 transition-colors">
                            <CardTitle className="text-white flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Lightbulb className="w-5 h-5 text-yellow-400" />
                                    Thông tin thú vị & Hậu trường
                                </div>
                                {isTriviaOpen ? (
                                    <ChevronUp className="w-5 h-5" />
                                ) : (
                                    <ChevronDown className="w-5 h-5" />
                                )}
                            </CardTitle>
                        </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <CardContent className="pt-0 space-y-6">
                            {/* Trivia */}
                            <div>
                                <h4 className="font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                                    <Lightbulb className="w-4 h-4" />
                                    Thông tin thú vị
                                </h4>
                                <ul className="space-y-2">
                                    {analysis.trivia.map((fact, index) => (
                                        <li key={index} className="flex items-start gap-2 text-gray-200">
                                            <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0" />
                                            {fact}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Behind the scenes */}
                            {analysis.behindTheScenes && analysis.behindTheScenes.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-blue-400 mb-3 flex items-center gap-2">
                                        <Camera className="w-4 h-4" />
                                        Hậu trường sản xuất
                                    </h4>
                                    <ul className="space-y-2">
                                        {analysis.behindTheScenes.map((scene, index) => (
                                            <li key={index} className="flex items-start gap-2 text-gray-200">
                                                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                                                {scene}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </CardContent>
                    </CollapsibleContent>
                </Card>
            </Collapsible>
        </div>
    );
} 