"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function BlogDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { slug } = params;

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch blog post by slug
  useEffect(() => {
    if (!slug) return;

    const fetchPost = async () => {
      setLoading(true);
      setError(null);

      try {
        const q = query(collection(db, "blogs"), where("slug", "==", slug));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setError("Post not found.");
          setLoading(false);
          return;
        }

        const docData = querySnapshot.docs[0].data();
        setPost({ id: querySnapshot.docs[0].id, ...docData });
      } catch (err) {
        setError("Failed to fetch post: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

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

  if (loading)
    return (
      <div className="max-w-3xl mx-auto py-10 text-center text-gray-500">
        Loading post...
      </div>
    );

  if (error)
    return (
      <div className="max-w-3xl mx-auto py-10 text-center text-red-500">
        {error}
        <div className="mt-4">
          <Button variant="outline" onClick={() => router.push("/blog")}>
            Back to Blog
          </Button>
        </div>
      </div>
    );

  return (
    <div className="max-w-3xl w-full mx-auto py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">
            {post.title}
          </CardTitle>
          <div className="text-gray-500 text-sm mt-2">
            <p>
              By{" "}
              <span className="font-medium">
                {post.createdBy?.name || "Unknown Author"}
              </span>{" "}
              • {formatDate(post.createdAt)}
            </p>
            {post.category && (
              <p className="mt-1 text-gray-400">
                Category: {post.category}
              </p>
            )}
          </div>
        </CardHeader>

        <CardContent className="prose max-w-none mt-6">
          {/* Markdown content */}
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {post.tags.map((tag, i) => (
                <span
                  key={i}
                  className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Author Info */}
          {post.createdBy && (
            <div className="mt-10 flex items-center gap-3 border-t pt-6">
              {post.createdBy.photoURL ? (
                <Image
                  src={post.createdBy.photoURL}
                  alt={post.createdBy.name}
                  className="w-10 h-10 rounded-full object-cover"
                  width={120}
                  height={120}
                  unoptimized
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-300" />
              )}
              <div>
                <p className="font-medium">{post.createdBy.name}</p>
                <p className="text-sm text-gray-500">
                  {post.createdBy.email}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
