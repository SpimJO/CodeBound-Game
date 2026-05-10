import { prisma } from '@/lib/prisma';
import { HttpError } from '../lib/error';

type CharacterCatalogItem = {
    id: string;
    name: string;
    tokenCost: number;
    isDefault: boolean;
};

const CHARACTER_CATALOG: CharacterCatalogItem[] = [
    { id: 'ranger', name: 'Ranger', tokenCost: 0, isDefault: true },
    { id: 'skeleton', name: 'Skeleton', tokenCost: 10000, isDefault: false },
    { id: 'minatour', name: 'Minatour', tokenCost: 20000, isDefault: false },
    { id: 'goblin', name: 'Goblin', tokenCost: 50000, isDefault: false },
];

class SkinService {
    private normalizeCharacterId(characterId: string) {
        const normalized = (characterId || '').trim().toLowerCase();
        if (normalized === 'default') return 'ranger';
        return normalized;
    }

    private getCharacterById(characterId: string) {
        return CHARACTER_CATALOG.find((c) => c.id === characterId);
    }

    private async ensureProgressAndDefaultOwnership(userId: string) {
        const progress = await prisma.userProgress.upsert({
            where: { userId },
            update: {},
            create: {
                userId,
                currentLevel: 1,
                highestLevel: 1,
                totalTokens: 0,
                equippedCharacter: 'default',
            },
        });

        // Ranger is always treated as the default owned character.
        await prisma.userCharacter.upsert({
            where: {
                userId_characterId: {
                    userId,
                    characterId: 'ranger',
                },
            },
            update: {},
            create: {
                userId,
                characterId: 'ranger',
            },
        });

        return progress;
    }

    /**
     * Get the current character state for a user.
     */
    async getUserCharacterState(userId: string) {
        const progress = await this.ensureProgressAndDefaultOwnership(userId);

        const ownedRows = await prisma.userCharacter.findMany({
            where: { userId },
            select: { characterId: true },
            orderBy: { unlockedAt: 'asc' },
        });

        const ownedCharacters = Array.from(
            new Set(
                ownedRows
                    .map((r) => this.normalizeCharacterId(r.characterId))
                    .filter((id) => !!this.getCharacterById(id))
            )
        );

        if (!ownedCharacters.includes('ranger')) {
            ownedCharacters.unshift('ranger');
        }

        const equippedCharacter = this.normalizeCharacterId(progress.equippedCharacter || 'default');

        return {
            equippedCharacter,
            ownedCharacters,
            availableCharacters: CHARACTER_CATALOG,
            totalTokens: progress.totalTokens,
        };
    }

    /**
     * Buy a character using user tokens.
     */
    async buyCharacter(userId: string, characterId: string) {
        const normalizedCharacterId = this.normalizeCharacterId(characterId);
        const character = this.getCharacterById(normalizedCharacterId);

        if (!character) {
            throw new HttpError(400, 'Invalid characterId');
        }

        // Ensure baseline records exist so first-time/legacy users can buy immediately.
        await this.ensureProgressAndDefaultOwnership(userId);

        if (character.tokenCost <= 0) {
            // Ensure default/free character is marked owned and return latest state.
            await this.ensureProgressAndDefaultOwnership(userId);
            return this.getUserCharacterState(userId);
        }

        await prisma.$transaction(async (tx) => {
            const progress = await tx.userProgress.findUnique({ where: { userId } });
            if (!progress) {
                throw new HttpError(404, 'User progress not found');
            }

            const existing = await tx.userCharacter.findUnique({
                where: {
                    userId_characterId: {
                        userId,
                        characterId: normalizedCharacterId,
                    },
                },
            });

            if (existing) {
                throw new HttpError(409, 'Character already purchased');
            }

            if (progress.totalTokens < character.tokenCost) {
                throw new HttpError(400, 'Not enough tokens to buy this character');
            }

            await tx.userProgress.update({
                where: { userId },
                data: {
                    totalTokens: progress.totalTokens - character.tokenCost,
                    lastPlayed: new Date(),
                },
            });

            await tx.userCharacter.create({
                data: {
                    userId,
                    characterId: normalizedCharacterId,
                },
            });
        });

        return this.getUserCharacterState(userId);
    }

    /**
     * Equip a character
     */
    async equipCharacter(userId: string, characterId: string) {
        const normalizedCharacterId = this.normalizeCharacterId(characterId);

        if (!normalizedCharacterId) {
            throw new HttpError(400, 'characterId is required');
        }

        const character = this.getCharacterById(normalizedCharacterId);
        if (!character) {
            throw new HttpError(400, 'Invalid characterId');
        }

        await this.ensureProgressAndDefaultOwnership(userId);

        const isOwned = await prisma.userCharacter.findUnique({
            where: {
                userId_characterId: {
                    userId,
                    characterId: normalizedCharacterId,
                },
            },
        });

        if (!isOwned) {
            throw new HttpError(400, 'Character not purchased yet');
        }

        const progress = await prisma.userProgress.update({
            where: { userId },
            data: {
                equippedCharacter: normalizedCharacterId,
                lastPlayed: new Date(),
            },
        });

        return {
            equippedCharacter: this.normalizeCharacterId(progress.equippedCharacter),
        };
    }
}

export default new SkinService();
