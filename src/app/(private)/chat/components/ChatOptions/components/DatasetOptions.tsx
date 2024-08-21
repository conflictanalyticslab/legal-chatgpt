import React from "react";
import { DatasetSelection } from "./RagToggle/components/DatasetSelection";

export default function DatasetOptions() {
  return (
    <div className="grid grid-rows-[auto_1fr] items-center gap-4 py-5">
      <h2 className="text-xl text-center font-bold">Dataset Options</h2>
      <DatasetSelection/>
    </div>
  );
}
