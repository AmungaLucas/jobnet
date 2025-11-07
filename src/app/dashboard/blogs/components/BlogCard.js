"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function BlogCard({ post }) {
    const router = useRouter();

    // Format Firestore timestamp
    const formatDate = (timestamp) => {
        if (!timestamp) return "";
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-800">
                    {post.title}
                </CardTitle>
                <div className="text-sm text-gray-500">
                    <p>
                        By <span className="font-medium">{post.createdBy?.name || "Unknown"}</span> •{" "}
                        {formatDate(post.createdAt)}
                    </p>
                    {post.category && (
                        <p className="mt-1 text-gray-400">Category: {post.category}</p>
                    )}
                </div>
            </CardHeader>

            <CardContent>
                {/* content preview (first 200 chars) */}
                <p className="text-gray-700 line-clamp-3">
                    {post.content?.replace(/[#_*`>]/g, "").slice(0, 200)}...
                </p>

                {/* tags */}
                {post.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                        {post.tags.map((tag, i) => (
                            <span
                                key={i}
                                className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Read more */}
                <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => router.push(`/blogs/${post.slug}`)}
                >
                    Read More
                </Button>
            </CardContent>
        </Card>
    );
}
