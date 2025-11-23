
import { UserProfile } from '../types';

const STORAGE_KEY_USER = 'odoursense_active_user';
const STORAGE_KEY_DB = 'odoursense_users_db';

interface AuthResponse {
    user: UserProfile;
    isNewUser: boolean;
}

// Helper to get simulated DB
const getUserDB = (): Record<string, UserProfile> => {
    const db = localStorage.getItem(STORAGE_KEY_DB);
    return db ? JSON.parse(db) : {};
};

const saveToUserDB = (user: UserProfile) => {
    const db = getUserDB();
    db[user.email] = user;
    localStorage.setItem(STORAGE_KEY_DB, JSON.stringify(db));
};

export const authenticateUser = async (email: string, password: string, name?: string, isSignup: boolean = false): Promise<AuthResponse> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (email.includes('error')) throw new Error("Invalid credentials");

    const db = getUserDB();
    let user = db[email];

    if (isSignup) {
        if (user) throw new Error("User already exists. Please login.");
        
        user = {
            id: 'u_' + Math.random().toString(36).substr(2, 9),
            name: name || email.split('@')[0],
            email: email,
            avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
            age: 30 + Math.floor(Math.random() * 20),
            weight: 70 + Math.floor(Math.random() * 20)
        };
        saveToUserDB(user);
        
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
        return { user, isNewUser: true };
    } else {
        if (!user) throw new Error("User not found. Please sign up.");
        // In a real app, we would check password hash here
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
        return { user, isNewUser: false };
    }
};

export const logoutUser = () => {
    localStorage.removeItem(STORAGE_KEY_USER);
};

export const getCurrentUser = (): UserProfile | null => {
    const data = localStorage.getItem(STORAGE_KEY_USER);
    return data ? JSON.parse(data) : null;
};
