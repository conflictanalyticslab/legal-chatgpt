"use client";
import React from "react";

import { DatasetSelection } from "../DatasetSelection";

import "./SearchDocuments.css";
import Documents from "../Documents";

const SearchDocuments = () => {
  return (
    <div
      id="search-documents"
      className="px-4 py-8 flex flex-col h-full gap-0 overflow-auto"
    >
      <DatasetSelection />
      <Documents />
    </div>
  );
};

export default SearchDocuments;
