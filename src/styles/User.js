export default class User {
    constructor (email, conversations, role, prompts_allowed, prompts_left ) {
        this.email = email;
        this.conversations = conversations;
        this.role = role;
        this.prompts_allowed = prompts_allowed;
        this.prompts_left = prompts_left;
    }
    toString() {
        return this.email + '\nRole: ' + this.role + '\nPrompts allowed: ' + this.prompts_allowed + '\nPrompts left: ' + this.prompts_left;
    }
}

export const userConverter = {
    toFirestore: (User) => {
        return {
            email: User.email,
            conversations: User.conversations,
            role: User.role,
            prompts_left: User.prompts_left,
            prompts_allowed: User.prompts_allowed
            };
    },
    fromFirestore: (snapshot, options) => {
        const data = snapshot.data(options);
        return new User(data.email, data.conversations, data.role, data.prompts_allowed, data.prompts_left);
    }
};