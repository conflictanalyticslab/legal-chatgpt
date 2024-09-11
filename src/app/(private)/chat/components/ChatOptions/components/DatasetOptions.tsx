import React from "react";
import { DatasetSelection } from "./DatasetSelection";

export default function DatasetOptions() {
  return (
    <div className="grid grid-rows-[auto_1fr] items-center gap-4 py-5">
      <h2 className="text-xl text-center font-bold">Dataset Filters</h2>
      <DatasetSelection/>
    </div>
  );
}
