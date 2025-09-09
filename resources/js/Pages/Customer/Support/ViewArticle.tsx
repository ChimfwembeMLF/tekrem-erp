import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Separator } from '@/Components/ui/separator';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { 
    ArrowLeft, 
    Book, 
    Eye,
    Calendar,
    User,
    ThumbsUp,
    ThumbsDown,
    CheckCircle,
    XCircle,
    ChevronRight,
    Share2,
    Bookmark
} from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface Article {
    id: number;
    title: string;
    content: string;
    excerpt: string;
    view_count: number;
    helpful_count: number;
    not_helpful_count: number;
    created_at: string;
    updated_at: string;
    category?: {
        id: number;
        name: string;
        color: string;
    };
    author?: {
        id: number;
        name: string;
    };
}

interface RelatedArticle {
    id: number;
    title: string;
    excerpt: string;
}

interface Props {
    article: Article;
    relatedArticles: RelatedArticle[];
}

export default function ViewArticle({ article, relatedArticles }: Props) {
    const route = useRoute();
    const [feedbackGiven, setFeedbackGiven] = useState(false);

    const { post: postHelpful, processing: helpfulProcessing } = useForm();
    const { post: postNotHelpful, processing: notHelpfulProcessing } = useForm();

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const handleHelpful = () => {
        postHelpful(route('customer.support.knowledge-base.helpful', article.id), {
            onSuccess: () => {
                setFeedbackGiven(true);
            },
        });
    };

    const handleNotHelpful = () => {
        postNotHelpful(route('customer.support.knowledge-base.not-helpful', article.id), {
            onSuccess: () => {
                setFeedbackGiven(true);
            },
        });
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: article.title,
                    text: article.excerpt,
                    url: window.location.href,
                });
            } catch (err) {
                // User cancelled sharing
            }
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            // You could show a toast notification here
        }
    };

    return (
        <CustomerLayout>
            <Head title={article.title} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('customer.support.knowledge-base.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Knowledge Base
                            </Button>
                        </Link>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleShare}>
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-4">
                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Article Header */}
                        <Card>
                            <CardHeader>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        {article.category && (
                                            <Badge 
                                                variant="outline"
                                                style={{ 
                                                    backgroundColor: article.category.color + '20', 
                                                    color: article.category.color 
                                                }}
                                            >
                                                {article.category.name}
                                            </Badge>
                                        )}
                                    </div>
                                    
                                    <h1 className="text-3xl font-bold tracking-tight">
                                        {article.title}
                                    </h1>
                                    
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        {article.author && (
                                            <div className="flex items-center gap-1">
                                                <User className="h-4 w-4" />
                                                <span>By {article.author.name}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            <span>{formatDate(article.created_at)}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Eye className="h-4 w-4" />
                                            <span>{article.view_count} views</span>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>

                        {/* Article Content */}
                        <Card>
                            <CardContent className="pt-6">
                                <div 
                                    className="prose prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{ __html: article.content }}
                                />
                            </CardContent>
                        </Card>

                        {/* Feedback Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Was this article helpful?</CardTitle>
                                <CardDescription>
                                    Your feedback helps us improve our documentation
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {feedbackGiven ? (
                                    <Alert>
                                        <CheckCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            Thank you for your feedback! We appreciate your input.
                                        </AlertDescription>
                                    </Alert>
                                ) : (
                                    <div className="flex items-center gap-4">
                                        <Button
                                            variant="outline"
                                            onClick={handleHelpful}
                                            disabled={helpfulProcessing}
                                            className="flex items-center gap-2"
                                        >
                                            <ThumbsUp className="h-4 w-4" />
                                            Yes ({article.helpful_count})
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={handleNotHelpful}
                                            disabled={notHelpfulProcessing}
                                            className="flex items-center gap-2"
                                        >
                                            <ThumbsDown className="h-4 w-4" />
                                            No ({article.not_helpful_count})
                                        </Button>
                                    </div>
                                )}

                                <Separator className="my-4" />

                                <div className="text-sm text-muted-foreground">
                                    <p>Still need help? <Link href={route('customer.support.create')} className="text-primary hover:underline">Create a support ticket</Link></p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Article Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Article Stats</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Views</span>
                                    <span className="font-medium">{article.view_count}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Helpful votes</span>
                                    <span className="font-medium text-green-600">{article.helpful_count}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Not helpful votes</span>
                                    <span className="font-medium text-red-600">{article.not_helpful_count}</span>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Last updated</span>
                                    <span className="text-sm">{formatDate(article.updated_at)}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Need More Help?</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Link href={route('customer.support.create')}>
                                    <Button className="w-full justify-start">
                                        <Book className="h-4 w-4 mr-2" />
                                        Create Support Ticket
                                    </Button>
                                </Link>
                                
                                <Link href={route('customer.support.knowledge-base.index')}>
                                    <Button variant="outline" className="w-full justify-start">
                                        <Book className="h-4 w-4 mr-2" />
                                        Browse All Articles
                                    </Button>
                                </Link>
                                
                                <Link href={route('customer.support.faq')}>
                                    <Button variant="outline" className="w-full justify-start">
                                        <Book className="h-4 w-4 mr-2" />
                                        View FAQ
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        {/* Related Articles */}
                        {relatedArticles.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Related Articles</CardTitle>
                                    <CardDescription>
                                        You might also find these helpful
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {relatedArticles.map((relatedArticle) => (
                                        <Link
                                            key={relatedArticle.id}
                                            href={route('customer.support.knowledge-base.show', relatedArticle.id)}
                                            className="block"
                                        >
                                            <div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-sm line-clamp-2 mb-1">
                                                            {relatedArticle.title}
                                                        </h4>
                                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                                            {relatedArticle.excerpt}
                                                        </p>
                                                    </div>
                                                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {/* Category Navigation */}
                        {article.category && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Category</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Link href={route('customer.support.knowledge-base.index', { category_id: article.category.id })}>
                                        <Button variant="outline" className="w-full justify-start">
                                            <div className="flex items-center gap-3">
                                                <div 
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: article.category.color }}
                                                />
                                                <span>{article.category.name}</span>
                                                <ChevronRight className="h-4 w-4 ml-auto" />
                                            </div>
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
