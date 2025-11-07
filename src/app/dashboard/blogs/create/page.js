"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "@/lib/firebase";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import MarkdownEditor from "../../jobs/create/components/MarkdownEditor";

export default function NewBlogPost() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Blog form state
  const [blog, setBlog] = useState({
    title: "",
    slug: "",
    category: "",
    content: "",
    tags: [],
  });

  const [tagInput, setTagInput] = useState("");

  // Handle generic field change
  const handleChange = (e) => {
    setBlog((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Add a new tag
  const addTag = () => {
    if (tagInput.trim() && !blog.tags.includes(tagInput.trim())) {
      setBlog((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  // Generate slug from title
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  // Submit new blog post
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!blog.title || !blog.content) {
      setError("Please fill in all required fields.");
      return;
    }

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      setError("You must be logged in to create a post.");
      return;
    }

    setLoading(true);

    try {
      // Auto-generate slug if not provided
      const slug = blog.slug || generateSlug(blog.title);

      // Add new blog to Firestore
      await addDoc(collection(db, "blogs"), {
        ...blog,
        slug,
        createdBy: {
          uid: user.uid,
          name: user.displayName || "Anonymous",
          email: user.email,
          photoURL: user.photoURL || null,
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Redirect to blog list page
      router.push("/blog");
    } catch (err) {
      setError(err.message || "Failed to create post.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl w-full mx-auto py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Create New Blog Post</CardTitle>
        </CardHeader>

        <CardContent>
          {error && <p className="text-red-600 mb-3">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <Label>Title *</Label>
              <Input
                name="title"
                value={blog.title}
                onChange={(e) => {
                  const newTitle = e.target.value;
                  setBlog((prev) => ({
                    ...prev,
                    title: newTitle,
                    slug: generateSlug(newTitle),
                  }));
                }}
                required
              />
            </div>

            {/* Slug */}
            <div>
              <Label>Slug (auto-generated)</Label>
              <Input
                name="slug"
                value={blog.slug}
                onChange={handleChange}
                placeholder="example-blog-post"
              />
            </div>

            {/* Category */}
            <div>
              <Label>Category</Label>
              <Input
                name="category"
                value={blog.category}
                onChange={handleChange}
                placeholder="React, Firebase, Design..."
              />
            </div>

            {/* Markdown Content */}
            <div>
              <Label>Content *</Label>
              <MarkdownEditor
                value={blog.content}
                onChange={(v) => setBlog((prev) => ({ ...prev, content: v }))}
              />
            </div>

            {/* Tags */}
            <div>
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag"
                />
                <Button type="button" onClick={addTag}>
                  Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                {blog.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="bg-gray-200 text-sm px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <Button type="submit" disabled={loading}>
              {loading ? "Publishing..." : "Publish Blog"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
