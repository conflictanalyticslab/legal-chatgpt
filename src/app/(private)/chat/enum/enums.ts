export enum DocumentQueryOptions {
  keywordSearchLabel = "Keyword Document Search",
  keywordSearchValue = "keyword-search",
  semanticSearchLabel = "Semantic Document Search",
  semanticSearchValue = "semantic-search",
  globalSearchLabel = "Global Semantic Document Search",
  globalSearchValue = "global-search",
}

export enum PineconeIndexes {
  staticDocuments = "legal-pdf-documents",
  dynamicDocuments = "global-search",
}

export enum PineconeNamespaces {
  canadian_law = "canadian_law",
  unitedStates_law = "usa_law",
  french_law = "french_law",
  australian_law = "australian_law",
}

export enum ChatAction {
  searchDocuments = "Search Documents",
  uploadDocuments = "Upload Documents",
  dataFilters = "Data Filters",
}
