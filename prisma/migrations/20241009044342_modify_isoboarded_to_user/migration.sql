/*
  Warnings:

  - You are about to drop the column `isOnboarded` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "isOnboarded",
ALTER COLUMN "createdAt" DROP NOT NULL,
ALTER COLUMN "dateModified" DROP NOT NULL;
