"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useDocument } from "react-firebase-hooks/firestore";
import { doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export default function JobDetail() {
  const { id } = useParams();
  const [snapshot, loading, error] = useDocument(doc(db, "jobs", id));

  if (loading)
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
      </div>
    );

  if (error) return <div className="text-center text-red-600">{error.message}</div>;
  if (!snapshot?.exists())
    return <div className="text-center text-gray-600 mt-10">Job not found.</div>;

  const job = snapshot.data();

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      {/* Header */}
      <div className="rounded-xl overflow-hidden mb-8">
        <div className="h-40 bg-linear-to-r from-orange-400 to-yellow-400"></div>
      </div>

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-semibold">{job.jobTitle}</h1>
          <p className="text-gray-600">{job.companyDescription || "Company"}</p>
          <p className="text-sm text-gray-500">
            {job.location || "Location not specified"} • Posted on {job.postDate}
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline">Save</Button>
          <Button className="bg-green-500 hover:bg-green-600 text-white">
            Apply
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-3">About the job</h2>
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: job.description }}
              />
            </CardContent>
          </Card>

          {job.responsibilities && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">Responsibilities</h3>
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: job.responsibilities }}
                />
              </CardContent>
            </Card>
          )}

          {job.qualifications && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">Qualifications</h3>
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: job.qualifications }}
                />
              </CardContent>
            </Card>
          )}

          {job.skills && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.split(",").map((skill, i) => (
                    <Badge key={i} variant="secondary">
                      {skill.trim()}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {job.howToApply && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">How to Apply</h3>
                <a
                  href={job.howToApply}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {job.howToApply}
                </a>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-2">
              <p className="text-3xl font-bold">
                {job.salary ? `$${job.salary.toLocaleString()}` : "—"}
              </p>
              <p className="text-gray-500">Average Salary</p>

              <div className="mt-4 space-y-2 text-sm text-gray-700">
                <p>
                  <strong>Category:</strong> {job.jobCategory}
                </p>
                <p>
                  <strong>Job Type:</strong> {job.jobType}
                </p>
                {job.jobLevel && (
                  <p>
                    <strong>Level:</strong> {job.jobLevel}
                  </p>
                )}
                {job.deadline && (
                  <p>
                    <strong>Deadline:</strong> {job.deadline}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {job.tags?.length ? (
                  job.tags.map((tag, i) => (
                    <Badge key={i} variant="outline">
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No tags listed</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
