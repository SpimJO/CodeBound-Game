import { prisma } from '@/lib/prisma';
import { userPublicSelect, type UserData } from '@/lib/userSelect';
import { HttpError } from '../lib/error';

const httpError = new HttpError();

export type ThemeTutorialKey = 'one' | 'two' | 'three';

class TutorialService {
    /**
     * Mark theme intro tutorial complete (levels 26 / 51 / 76 — client maps level → theme).
     */
    async completeThemeTutorial(userId: string, theme: ThemeTutorialKey): Promise<{ user: UserData }> {
        const data =
            theme === 'one'
                ? { theme_one: 1 }
                : theme === 'two'
                  ? { theme_two: 1 }
                  : { theme_three: 1 };

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data,
            select: userPublicSelect,
        });

        return { user: updatedUser };
    }

    parseTheme(body: unknown): ThemeTutorialKey {
        const theme = typeof body === 'object' && body !== null && 'theme' in body ? (body as { theme?: unknown }).theme : undefined;
        if (theme === 'one' || theme === 'two' || theme === 'three') {
            return theme;
        }
        throw httpError.badRequest('theme must be "one", "two", or "three"');
    }
}

export default new TutorialService();
