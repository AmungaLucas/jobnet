"use client";
import dynamic from "next/dynamic";
import React from "react";

// Dynamically import MDEditor (it uses window)
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export default function MarkdownEditor({ label, value, onChange }) {
  return (
    <div data-color-mode="light" className="space-y-2">
      <label className="block font-medium">{label}</label>
      <div className="border rounded-lg overflow-hidden">
        <MDEditor
          className="leading-tight"
          value={value}
          onChange={onChange}
          preview="edit"
          height={200}
        />
      </div>
    </div>
  );
}
