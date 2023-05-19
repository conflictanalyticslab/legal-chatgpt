export default class User {
    constructor (email, conversations, role, prompts ) {
        this.email = email;
        this.conversations = conversations;
        this.role = role;
        this.prompts_allowed = prompts['allowed'];
        this.prompts_used = prompts['used'];
    }
    toString() {
        return this.email + '\nRole: ' + this.role + '\nPrompts allowed: ' + this.prompts_allowed + '\nPrompts used: ' + this.prompts_used;
    }
}

export const userConverter = {
    toFirestore: (User) => {
        return {
            email: User.email,
            conversations: User.conversations,
            role: User.role,
            prompts: {'allowed': User.prompts_allowed, 'used': User.prompts_used}
            };
    },
    fromFirestore: (snapshot, options) => {
        const data = snapshot.data(options);
        return new City(data.email, data.conversations, data.role, data.prompts);
    }
};