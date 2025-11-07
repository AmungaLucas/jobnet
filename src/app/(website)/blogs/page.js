"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import BlogCard from "@/app/dashboard/blogs/components/BlogCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function BlogListPage() {
  const [blogs, setBlogs] = useState([]);
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [latestPosts, setLatestPosts] = useState([]);
  const [otherPosts, setOtherPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Fetch all blogs from Firestore ---
  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const q = query(collection(db, "blogs"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setBlogs(data);

        // Split into categories
        const featured = data.filter((b) => b.featured);
        const latest = data.slice(0, 3);
        const others = data.filter(
          (b) => !b.featured && !latest.some((lp) => lp.id === b.id)
        );

        setFeaturedPosts(featured);
        setLatestPosts(latest);
        setOtherPosts(others);
      } catch (err) {
        setError("Failed to load blogs: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // --- Loading state ---
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-10 text-center text-gray-500">
        Loading blog posts...
      </div>
    );
  }

  // --- Error state ---
  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-10 text-center text-red-500">
        {error}
        <div className="mt-4">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // --- Empty state ---
  if (blogs.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-10 text-center text-gray-500">
        No blog posts found.
      </div>
    );
  }

  return (
    <div className="max-w-5xl w-full mx-auto py-10 px-4">
      {/* --- Page Header --- */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Blog</h1>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Refresh
        </Button>
      </div>

      {/* --- Featured Posts Section --- */}
      {featuredPosts.length > 0 && (
        <Section title="Featured Posts">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {featuredPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        </Section>
      )}

      {/* --- Latest Posts Section --- */}
      {latestPosts.length > 0 && (
        <Section title="Latest Posts">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {latestPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        </Section>
      )}

      {/* --- All Other Posts Section --- */}
      {otherPosts.length > 0 && (
        <Section title="All Posts">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {otherPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

/* --- Reusable Section Wrapper --- */
function Section({ title, children }) {
  return (
    <Card className="mb-12">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-800">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
