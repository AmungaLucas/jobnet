"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { IconEdit, IconTrash } from "@tabler/icons-react";

export function JobTableRow({ job, onEdit, onDelete }) {
  const router = useRouter();

  // Handle clicking the row to go to job detail
  const handleRowClick = () => {
    router.push(`/jobs/${job.id}`);
  };

  return (
    <tr
      className="border-b hover:bg-muted/10 transition-colors cursor-pointer"
      onClick={handleRowClick}
    >
      <td className="px-4 py-2 font-medium">{job.jobTitle}</td>
      <td className="px-4 py-2">
        {job.createdAt?.seconds
          ? new Date(job.createdAt.seconds * 1000).toLocaleDateString()
          : "—"}
      </td>
      <td className="px-4 py-2">
        {job.updatedAt?.seconds
          ? new Date(job.updatedAt.seconds * 1000).toLocaleDateString()
          : "—"}
      </td>
      <td className="px-4 py-2">{job.jobCategory || "—"}</td>
      <td className="px-4 py-2">
        {job.deadline ? new Date(job.deadline).toLocaleDateString() : "—"}
      </td>
      <td
        className="px-4 py-2 flex gap-2"
        onClick={(e) => e.stopPropagation()} // ✅ prevent row click when pressing buttons
      >
        <Button
          size="sm"
          variant="outline"
          onClick={() => onEdit(job)}
          title="Edit"
        >
          <IconEdit className="size-4" />
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => onDelete(job)}
          title="Delete"
        >
          <IconTrash className="size-4" />
        </Button>
      </td>
    </tr>
  );
}
