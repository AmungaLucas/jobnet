"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { db } from "@/lib/firebase";
import MarkdownEditor from "./components/MarkdownEditor";
import { Calendar } from "@/components/ui/calendar";
import { categoryData, jobTypes, jobLevels } from "@/data/DropdownData";

export default function PostJob() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [job, setJob] = useState({
    jobId: "",
    jobTitle: "",
    jobCategory: "",
    jobSubcategory: "",
    jobLevel: "",
    jobType: "",
    positions: 1,
    postDate: new Date().toISOString().split("T")[0],
    experience: "",
    educationLevel: "",
    qualifications: "",
    responsibilities: "",
    skills: "",
    location: "",
    salary: 0,
    description: "",
    deadline: "",
    status: "Open",
    howToApply: "",
    tags: [],
    keywords: [],
    companyDescription: "",
  });

  const [date, setDate] = useState(null);
  const [availableSubcategories, setAvailableSubcategories] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [keywordInput, setKeywordInput] = useState("");

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setJob((prev) => {
      if (name === "jobCategory") {
        const category = categoryData.find((cat) => cat.name === value);
        setAvailableSubcategories(category ? category.subcategories : []);
        return { ...prev, jobCategory: value, jobSubcategory: "" };
      }
      return { ...prev, [name]: value };
    });
  };

  // Add tag
  const addTag = () => {
    const newTag = tagInput.trim();
    if (newTag && !job.tags.includes(newTag)) {
      setJob((prev) => ({ ...prev, tags: [...prev.tags, newTag] }));
      setTagInput("");
    }
  };

  // Add keyword
  const addKeyword = () => {
    const newKeyword = keywordInput.trim();
    if (newKeyword && !job.keywords.includes(newKeyword)) {
      setJob((prev) => ({ ...prev, keywords: [...prev.keywords, newKeyword] }));
      setKeywordInput("");
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const user = getAuth().currentUser;
    if (!user) {
      setError("You must be logged in to post a job.");
      return;
    }

    if (!job.jobTitle || !job.jobCategory || !job.jobType || !job.description) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      await addDoc(collection(db, "jobs"), {
        ...job,
        jobId,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      router.push("/");
    } catch (err) {
      setError(err.message || "Failed to post job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Post a New Job</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-600 mb-3">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Job Title */}
            <div>
              <Label>Job Title *</Label>
              <Input
                name="jobTitle"
                value={job.jobTitle}
                onChange={handleChange}
                required
              />
            </div>

            {/* Company Description */}
            <div>
              <Label>Company Description</Label>
              <Textarea
                name="companyDescription"
                value={job.companyDescription}
                onChange={handleChange}
              />
            </div>

            {/* Category + Subcategory */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Job Category *</Label>
                <select
                  name="jobCategory"
                  value={job.jobCategory}
                  onChange={handleChange}
                  className="w-full border rounded-md p-2"
                  required
                >
                  <option value="">Select Category</option>
                  {categoryData.map((cat) => (
                    <option key={cat.name} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Subcategory</Label>
                <select
                  name="jobSubcategory"
                  value={job.jobSubcategory}
                  onChange={handleChange}
                  className="w-full border rounded-md p-2"
                  disabled={!availableSubcategories.length}
                >
                  <option value="">Select Subcategory</option>
                  {availableSubcategories.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Level + Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Job Level</Label>
                <select
                  name="jobLevel"
                  value={job.jobLevel}
                  onChange={handleChange}
                  className="w-full border rounded-md p-2"
                >
                  <option value="">Select Level</option>
                  {jobLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Job Type *</Label>
                <select
                  name="jobType"
                  value={job.jobType}
                  onChange={handleChange}
                  className="w-full border rounded-md p-2"
                  required
                >
                  <option value="">Select Type</option>
                  {jobTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Markdown Sections */}
            <div>
              <Label>Description *</Label>
              <MarkdownEditor
                value={job.description}
                onChange={(v) => setJob((prev) => ({ ...prev, description: v }))}
              />
            </div>

            <div>
              <Label>Qualifications</Label>
              <MarkdownEditor
                value={job.qualifications}
                onChange={(v) => setJob((prev) => ({ ...prev, qualifications: v }))}
              />
            </div>

            <div>
              <Label>Responsibilities</Label>
              <MarkdownEditor
                value={job.responsibilities}
                onChange={(v) => setJob((prev) => ({ ...prev, responsibilities: v }))}
              />
            </div>

            {/* Skills & Salary */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Skills</Label>
                <Input name="skills" value={job.skills} onChange={handleChange} />
              </div>
              <div>
                <Label>Salary</Label>
                <Input
                  type="number"
                  name="salary"
                  value={job.salary}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Deadline */}
            <div>
              <Label>Deadline</Label>
              <Calendar
                mode="single"
                selected={date}
                onSelect={(selectedDate) => {
                  setDate(selectedDate);
                  setJob((prev) => ({
                    ...prev,
                    deadline: selectedDate
                      ? selectedDate.toISOString().split("T")[0]
                      : "",
                  }));
                }}
                className="rounded-lg border max-w-sm"
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
                <Button type="button" onClick={addTag}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {job.tags.map((t, i) => (
                  <span key={i} className="bg-gray-200 text-sm px-2 py-1 rounded-full">{t}</span>
                ))}
              </div>
            </div>

            {/* Keywords */}
            <div>
              <Label>Keywords</Label>
              <div className="flex gap-2">
                <Input
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  placeholder="Add a keyword"
                />
                <Button type="button" onClick={addKeyword}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {job.keywords.map((k, i) => (
                  <span key={i} className="bg-gray-200 text-sm px-2 py-1 rounded-full">{k}</span>
                ))}
              </div>
            </div>

            {/* How to Apply */}
            <div>
              <Label>How to Apply</Label>
              <Input
                name="howToApply"
                value={job.howToApply}
                onChange={handleChange}
                placeholder="Link or email"
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Posting..." : "Post Job"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
