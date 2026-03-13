import { prisma } from '@/lib/prisma';
import { HttpError } from '../lib/error';

class SkinService {
    /**
     * Get the current character state for a user.
     */
    async getUserCharacterState(userId: string) {
        const progress = await prisma.userProgress.findUnique({
            where: { userId },
            select: { equippedCharacter: true },
        });

        if (!progress) {
            throw new HttpError(404, 'User progress not found');
        }

        return progress;
    }

    /**
     * Equip a character
     */
    async equipCharacter(userId: string, characterId: string) {
        const normalizedCharacterId = (characterId || '').trim().toLowerCase();

        if (!normalizedCharacterId) {
            throw new HttpError(400, 'characterId is required');
        }

        const progress = await prisma.userProgress.update({
            where: { userId },
            data: {
                equippedCharacter: normalizedCharacterId,
            },
        });

        return progress;
    }
}

export default new SkinService();
