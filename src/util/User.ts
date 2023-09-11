export type UserI = {
  email: string;
  conversations: any[];
  role: string;
  prompts_allowed: number;
  prompts_left: number;
  verified: boolean;
};

export default class User {
  email: UserI["email"];
  conversations: UserI["conversations"];
  role: UserI["role"];
  prompts_allowed: UserI["prompts_allowed"];
  prompts_left: UserI["prompts_left"];
  verified: UserI["verified"];

  constructor(
    email: UserI["email"],
    conversations: UserI["conversations"],
    role: UserI["role"],
    prompts_allowed: UserI["prompts_allowed"],
    prompts_left: UserI["prompts_left"],
    verified: UserI["verified"]
  ) {
    this.email = email;
    this.conversations = conversations;
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
      conversations: user.conversations,
      role: user.role,
      prompts_left: user.prompts_left,
      prompts_allowed: user.prompts_allowed,
      verified: user.verified,
    };
  },
  fromFirestore: (snapshot: any, options: any) => {
    const data = snapshot.data(options);
    return new User(
      data.email,
      data.conversations,
      data.role,
      data.prompts_allowed,
      data.prompts_left,
      data.verified
    );
  },
};
