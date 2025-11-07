"use client";

import React, { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { JobTableRow } from "@/components/JobTableRow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DNA } from "react-loader-spinner";

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jobsCollection = collection(db, "jobs");
        const q = query(jobsCollection, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const jobsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setJobs(jobsData);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleEdit = (job) => {
    console.log("Edit job", job);
    // router.push(`/jobs/edit/${job.id}`) — optional
  };

  const handleDelete = async (job) => {
    console.log("Delete job", job);
    // await deleteDoc(doc(db, "jobs", job.id));
    setJobs((prev) => prev.filter((j) => j.id !== job.id));
  };

  if (loading)
    return (
      <div className="flex items-center justify-center p-6 text-center">
        <DNA visible={true} height="80" width="80" ariaLabel="dna-loading" />
      </div>
    );

  return (
    <div className="min-h-screen bg-background p-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Job Listings</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="min-w-full divide-y divide-muted">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium">Job Title</th>
                <th className="px-4 py-2 text-left text-sm font-medium">Created At</th>
                <th className="px-4 py-2 text-left text-sm font-medium">Updated At</th>
                <th className="px-4 py-2 text-left text-sm font-medium">Job Category</th>
                <th className="px-4 py-2 text-left text-sm font-medium">Deadline</th>
                <th className="px-4 py-2 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-muted">
              {jobs.map((job) => (
                <JobTableRow
                  key={job.id}
                  job={job}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
