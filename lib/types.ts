/**
 * User type for WorkOS authentication
 */
export interface AppUser {
    id?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    profilePictureUrl?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    emailVerified?: boolean | null;
}

