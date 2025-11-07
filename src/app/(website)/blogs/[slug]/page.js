"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";
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
  const { slug } = useParams();

  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [latestPosts, setLatestPosts] = useState([]);
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Fetch main post ---
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
        const postData = { id: querySnapshot.docs[0].id, ...docData };
        setPost(postData);

        // Once post is loaded, fetch related content
        await fetchExtras(postData);
      } catch (err) {
        setError("Failed to fetch post: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  // --- Fetch related, latest, featured posts ---
  const fetchExtras = async (postData) => {
    try {
      const postsRef = collection(db, "blogs");

      // Related posts: same category or overlapping tags
      let relatedQuery = query(
        postsRef,
        where("category", "==", postData.category)
      );
      const relatedSnap = await getDocs(relatedQuery);
      const related = relatedSnap.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((p) => p.slug !== postData.slug)
        .slice(0, 3);
      setRelatedPosts(related);

      // Latest posts: newest first
      const latestQuery = query(postsRef, orderBy("createdAt", "desc"), limit(3));
      const latestSnap = await getDocs(latestQuery);
      const latest = latestSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLatestPosts(latest);

      // Featured posts: where featured == true
      const featuredQuery = query(postsRef, where("featured", "==", true), limit(3));
      const featuredSnap = await getDocs(featuredQuery);
      const featured = featuredSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFeaturedPosts(featured);
    } catch (err) {
      console.error("Error fetching related/extra posts:", err);
    }
  };

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
    <div className="max-w-4xl w-full mx-auto py-10 px-4">
      {/* --- Main Post --- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">{post.title}</CardTitle>
          <div className="text-gray-500 text-sm mt-2">
            <p>
              By{" "}
              <span className="font-medium">
                {post.createdBy?.name || "Unknown Author"}
              </span>{" "}
              • {formatDate(post.createdAt)}
            </p>
            {post.category && (
              <p className="mt-1 text-gray-400">Category: {post.category}</p>
            )}
          </div>
        </CardHeader>

        <CardContent className="prose max-w-none mt-6">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>

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

      {/* --- Extra Sections --- */}
      <div className="mt-10 space-y-10">
        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <Section title="Related Posts" posts={relatedPosts} router={router} />
        )}

        {/* Latest Posts */}
        {latestPosts.length > 0 && (
          <Section title="Latest Posts" posts={latestPosts} router={router} />
        )}

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <Section title="Featured Posts" posts={featuredPosts} router={router} />
        )}
      </div>
    </div>
  );
}

/* --- Reusable Section Component --- */
function Section({ title, posts, router }) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Card
            key={post.id}
            className="cursor-pointer hover:shadow-lg transition"
            onClick={() => router.push(`/blog/${post.slug}`)}
          >
            <CardHeader>
              <CardTitle className="text-lg">{post.title}</CardTitle>
              {post.category && (
                <p className="text-sm text-gray-400">{post.category}</p>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-12 text-gray-600 line-clamp-3">
                {post.content?.slice(0, 100)}...
              </p>
              <Button
                variant="link"
                className="mt-3 px-0"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/blogs/${post.slug}`);
                }}
              >
                Read More →
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
