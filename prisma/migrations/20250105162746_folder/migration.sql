-- DropForeignKey
ALTER TABLE `folder` DROP FOREIGN KEY `Folder_parentId_fkey`;

-- DropIndex
DROP INDEX `Folder_parentId_fkey` ON `folder`;

-- AddForeignKey
ALTER TABLE `Folder` ADD CONSTRAINT `Folder_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `Folder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
