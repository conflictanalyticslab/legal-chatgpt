"use client";

import React from "react";
import type { Metadata } from "next";
import AppSearchAPIConnector from "@elastic/search-ui-app-search-connector";
import { SearchProvider } from "@elastic/react-search-ui";

export const metadata: Metadata = {
  title: "OpenJustice Chat",
  description: "Generative AI for Law",
};

const connector = new AppSearchAPIConnector({
  searchKey: process.env.NEXT_PUBLIC_PUBLIC_SEARCH_KEY,
  engineName: "open-justice-meta",
  endpointBase: process.env.NEXT_PUBLIC_ENDPOINT_URL || "",
});

const elasticSearchConfig = {
  alwaysSearchOnInitialLoad: false,
  apiConnector: connector,
  hasA11yNotifications: true,
  searchQuery: {
    filters: [],
    result_fields: {
      title: {
        snippet: {
          fallback: true,
          size: 100,
        },
      },
      source: { raw: {} },
      abstract: {
        snippet: {
          fallback: true,
          size: 500,
        },
      },
      body: {
        snippet: {
          fallback: true,
        },
      },
      url: { raw: {} },
    },
    search_fields: { title: {} },
    disjunctiveFacets: ["source"],
    facets: { source: { type: "value", size: 30 } },
  },
};

export default function SearchProviderShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SearchProvider config={elasticSearchConfig}>{children}</SearchProvider>
  );
}
