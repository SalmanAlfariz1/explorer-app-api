/*
  Warnings:

  - You are about to drop the column `file` on the `file` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `file` DROP COLUMN `file`,
    ADD COLUMN `file_upload` TEXT NULL;
