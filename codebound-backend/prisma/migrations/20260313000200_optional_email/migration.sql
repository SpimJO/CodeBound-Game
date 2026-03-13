-- AlterTable: Make email column optional (nullable) on users table.
-- Multiple NULL values are allowed under a UNIQUE index in MySQL.
ALTER TABLE `users` MODIFY `email` VARCHAR(191) NULL;
