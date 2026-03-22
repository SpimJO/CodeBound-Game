-- Add claim tracking to user_achievements so rewards can be claimed once per user.
ALTER TABLE `user_achievements`
  ADD COLUMN `claimedAt` DATETIME(3) NULL;
