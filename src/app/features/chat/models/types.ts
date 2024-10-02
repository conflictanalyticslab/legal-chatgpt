// #region User
export type UserI = {
  email: string;
  role: string;
  prompts_allowed: number;
  prompts_left: number;
  verified: boolean;
};

export default class User {
  email: UserI["email"];
  role: UserI["role"];
  prompts_allowed: UserI["prompts_allowed"];
  prompts_left: UserI["prompts_left"];
  verified: UserI["verified"];

  constructor(
    email: UserI["email"],
    role: UserI["role"],
    prompts_allowed: UserI["prompts_allowed"],
    prompts_left: UserI["prompts_left"],
    verified: UserI["verified"]
  ) {
    this.email = email;
    this.role = role;
    this.prompts_allowed = prompts_allowed;
    this.prompts_left = prompts_left;
    this.verified = Boolean(verified);
  }
  toString() {
    return (
      this.email +
      "\nRole: " +
      this.role +
      "\nPrompts allowed: " +
      this.prompts_allowed +
      "\nPrompts left: " +
      this.prompts_left
    );
  }
}

export const userConverter = {
  toFirestore: (user: UserI) => {
    return {
      email: user.email,
      role: user.role,
      prompts_left: user.prompts_left,
      prompts_allowed: user.prompts_allowed,
      verified: user.verified,
    };
  },
  fromFirestore: (snapshot: any) => {
    const data = snapshot.data();
    return new User(
      data.email,
      data.role,
      data.prompts_allowed,
      data.prompts_left,
      data.verified
    );
  },
};

// #region Conversation 
export type TextMetadata = {
  chunk: number;
  fileName: string;
  url: string;
  text: string;
};

// Conversation Firestore Document Type
export type ConversationDoc = {
  conversation: Conversation;
  documents: string[];
  title: string;
  userId: string;
};

export type Conversation = {
  content: string;
  role: string;
};

export type ApiResponse<T> = {
  success: boolean;
  error?: string | null;
  data: T | null;
};

export type ConversationalRetrievalQAChainInput = {
  question: string;
  chat_history: Conversation[];
};

export interface ConversationTitles {
  uid:string,
  title: string,
}

export interface Response {
  response: string;
}

// #region Document
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

export type RelevantDocument = {
  url: string;
  fileName: string;
  content: string;
};
