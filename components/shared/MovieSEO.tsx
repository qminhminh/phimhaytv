'use client';

import Head from 'next/head';
import { EnhancedMovieDetail } from '@/lib/api';

interface MovieSEOProps {
    movie: EnhancedMovieDetail;
    episodes?: any[];
}

export function MovieSEO({ movie, episodes }: MovieSEOProps) {
    // Tạo structured data cho Google
    const movieStructuredData = {
        "@context": "https://schema.org",
        "@type": "Movie",
        "name": movie.name,
        "alternateName": movie.origin_name,
        "description": movie.uniqueDescription,
        "image": movie.poster_url,
        "datePublished": movie.year.toString(),
        "director": movie.director.map(d => ({
            "@type": "Person",
            "name": d
        })),
        "actor": movie.actor.slice(0, 5).map(a => ({
            "@type": "Person", 
            "name": a
        })),
        "genre": movie.category.map(c => c.name),
        "productionCompany": {
            "@type": "Organization",
            "name": movie.country[0]?.name || "Unknown"
        },
        "duration": movie.time,
        "inLanguage": movie.lang,
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": movie.userStats.averageRating,
            "reviewCount": movie.userStats.totalRatings,
            "bestRating": 10,
            "worstRating": 1
        },
        "review": movie.featuredReviews.slice(0, 3).map(review => ({
            "@type": "Review",
            "author": {
                "@type": "Person",
                "name": review.userName
            },
            "datePublished": review.createdAt,
            "reviewBody": review.review,
            "reviewRating": {
                "@type": "Rating",
                "ratingValue": review.rating,
                "bestRating": 10,
                "worstRating": 1
            }
        })),
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "VND",
            "availability": "https://schema.org/InStock"
        },
        "publisher": {
            "@type": "Organization",
            "name": "PhimHayTV",
            "url": "https://phimaytv.com"
        }
    };

    // Structured data cho TV Series nếu có nhiều tập
    const tvSeriesStructuredData = episodes && episodes.length > 1 ? {
        "@context": "https://schema.org",
        "@type": "TVSeries",
        "name": movie.name,
        "description": movie.uniqueDescription,
        "image": movie.poster_url,
        "numberOfEpisodes": episodes.reduce((total, ep) => total + ep.server_data.length, 0),
        "genre": movie.category.map(c => c.name),
        "actor": movie.actor.slice(0, 5).map(a => ({
            "@type": "Person",
            "name": a
        })),
        "director": movie.director.map(d => ({
            "@type": "Person", 
            "name": d
        })),
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": movie.userStats.averageRating,
            "reviewCount": movie.userStats.totalRatings,
            "bestRating": 10,
            "worstRating": 1
        }
    } : null;

    // Article structured data cho nội dung biên tập
    const articleStructuredData = movie.editorialContent ? {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": movie.editorialContent.title,
        "description": movie.editorialContent.subtitle || movie.uniqueDescription,
        "author": {
            "@type": "Person",
            "name": movie.editorialContent.author,
            "description": movie.editorialContent.authorBio
        },
        "publisher": {
            "@type": "Organization",
            "name": "PhimHayTV",
            "logo": {
                "@type": "ImageObject",
                "url": "/logoPhimHayTV.png"
            }
        },
        "datePublished": movie.editorialContent.publishedAt,
        "dateModified": movie.editorialContent.publishedAt,
        "image": movie.poster_url,
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `https://phimhaytv.com/movies/${movie.slug}`
        },
        "keywords": movie.editorialContent.tags.join(", "),
        "about": {
            "@type": "Movie",
            "name": movie.name
        }
    } : null;

    // FAQ structured data dựa trên analysis
    const faqStructuredData = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": `${movie.name} có hay không?`,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": `${movie.analysis.plotSummary} Điểm mạnh của phim bao gồm: ${movie.analysis.strengths.join(', ')}.`
                }
            },
            {
                "@type": "Question", 
                "name": `${movie.name} phù hợp với ai?`,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": `Phim phù hợp với ${movie.analysis.bestFor.join(', ')}.`
                }
            },
            movie.analysis.contentWarnings.length > 0 ? {
                "@type": "Question",
                "name": `${movie.name} có nội dung không phù hợp không?`,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": `Lưu ý: ${movie.analysis.contentWarnings.join(', ')}.`
                }
            } : null,
            movie.analysis.culturalContext ? {
                "@type": "Question",
                "name": `Bối cảnh văn hóa của ${movie.name}?`,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": movie.analysis.culturalContext
                }
            } : null
        ].filter(Boolean)
    };

    // Breadcrumb structured data
    const breadcrumbStructuredData = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Trang chủ",
                "item": "https://phimhaytv.com"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": movie.category[0]?.name || "Phim",
                "item": `https://phimhaytv.com/categories/${movie.category[0]?.slug}`
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": movie.name,
                "item": `https://phimhaytv.com/movies/${movie.slug}`
            }
        ]
    };

    // Tạo meta description độc đáo
    const uniqueMetaDescription = `${movie.name} (${movie.year}) - ${movie.uniqueDescription.substring(0, 120)}... Xem phim chất lượng HD tại PhimHayTV. Đánh giá: ${movie.userStats.averageRating}/10 từ ${movie.userStats.totalRatings} người dùng.`;

    // Keywords độc đáo dựa trên analysis
    const uniqueKeywords = [
        movie.name,
        movie.origin_name,
        ...movie.category.map(c => c.name),
        ...movie.country.map(c => c.name),
        ...movie.director,
        ...movie.actor.slice(0, 3),
        `phim ${movie.year}`,
        movie.lang,
        "PhimHayTV",
        "phim hay",
        "xem phim online",
        ...movie.analysis.bestFor
    ].filter(Boolean).join(", ");

    return (
        <>
            {/* Meta tags cho SEO */}
            <Head>
                <title>{movie.name} ({movie.year}) - Phân tích chuyên sâu | PhimHayTV</title>
                <meta name="description" content={uniqueMetaDescription} />
                <meta name="keywords" content={uniqueKeywords} />
                
                {/* Open Graph tags */}
                <meta property="og:title" content={`${movie.name} (${movie.year}) - Đánh giá & Phân tích`} />
                <meta property="og:description" content={uniqueMetaDescription} />
                <meta property="og:image" content={movie.poster_url} />
                <meta property="og:type" content="video.movie" />
                <meta property="og:url" content={`https://phimhaytv.com/movies/${movie.slug}`} />
                <meta property="og:site_name" content="PhimHayTV" />
                
                {/* Twitter Card tags */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={`${movie.name} (${movie.year})`} />
                <meta name="twitter:description" content={uniqueMetaDescription} />
                <meta name="twitter:image" content={movie.poster_url} />
                
                {/* Additional SEO tags */}
                <meta name="author" content="PhimHayTV" />
                <meta name="robots" content="index, follow, max-image-preview:large" />
                <meta name="rating" content={movie.userStats.averageRating.toString()} />
                <meta name="content-language" content="vi" />
                
                {/* Canonical URL */}
                <link rel="canonical" href={`https://phimhaytv.com/movies/${movie.slug}`} />
                
                {/* Structured Data */}
                <script 
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(movieStructuredData) }}
                />
                
                {tvSeriesStructuredData && (
                    <script 
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{ __html: JSON.stringify(tvSeriesStructuredData) }}
                    />
                )}
                
                {articleStructuredData && (
                    <script 
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleStructuredData) }}
                    />
                )}
                
                <script 
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
                />
                
                <script 
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
                />
            </Head>
        </>
    );
} 