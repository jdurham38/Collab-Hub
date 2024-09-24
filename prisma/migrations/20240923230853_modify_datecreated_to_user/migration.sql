/*
  Warnings:

  - The `dateModified` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropIndex
DROP INDEX "users_dateModified_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "dateModified",
ADD COLUMN     "dateModified" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
