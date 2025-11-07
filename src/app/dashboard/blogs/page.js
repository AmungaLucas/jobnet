"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import BlogCard from "./components/BlogCard";

export default function BlogListPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all blogs from Firestore
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
      } catch (err) {
        setError("Failed to load blogs: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  return (
    <div className="max-w-4xl w-full mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Blog Posts</h1>
        <Button onClick={() => window.location.reload()}>Refresh</Button>
      </div>

      {loading && (
        <p className="text-gray-500 text-center">Loading blog posts...</p>
      )}

      {error && (
        <p className="text-red-500 text-center mb-4">{error}</p>
      )}

      {!loading && blogs.length === 0 && (
        <p className="text-gray-500 text-center">No blogs found.</p>
      )}

      <div className="space-y-6">
        {blogs.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
