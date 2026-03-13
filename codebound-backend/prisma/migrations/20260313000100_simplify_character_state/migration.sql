ALTER TABLE `user_progress`
    CHANGE COLUMN `equippedSkin` `equippedCharacter` VARCHAR(191) NOT NULL DEFAULT 'default';

DROP TABLE IF EXISTS `user_skins`;
