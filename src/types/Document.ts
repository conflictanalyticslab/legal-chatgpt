export type Document = {
  chunk?: number;
  fileName: string;
  text: string;
  url: string;
};

export type UploadedDocument = {
  name: string;
  text: string;
  userUid: string;
};
