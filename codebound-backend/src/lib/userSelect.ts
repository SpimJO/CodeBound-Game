import { Prisma } from '@prisma/client';

/** Session / profile user fields (no password). */
export const userPublicSelect = Prisma.validator<Prisma.UserSelect>()({
    id: true,
    username: true,
    old_user: true,
    theme_one: true,
    theme_two: true,
    theme_three: true,
    created_at: true,
    updated_at: true,
});

/** Same scalars plus nested progress for `/auth` session responses. */
export const userWithProgressSelect = Prisma.validator<Prisma.UserSelect>()({
    id: true,
    username: true,
    old_user: true,
    theme_one: true,
    theme_two: true,
    theme_three: true,
    created_at: true,
    updated_at: true,
    progress: {
        select: {
            currentLevel: true,
            highestLevel: true,
            totalTokens: true,
            equippedCharacter: true,
            lastPlayed: true,
        },
    },
});

export type UserPublicPayload = Prisma.UserGetPayload<{ select: typeof userPublicSelect }>;
export type UserWithProgressPayload = Prisma.UserGetPayload<{ select: typeof userWithProgressSelect }>;

/** API-facing user row without password (alias for Prisma payload). */
export type UserData = UserPublicPayload;
/** Session user including nested progress. */
export type UserWithProgress = UserWithProgressPayload;
