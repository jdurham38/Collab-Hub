/*
  Warnings:

  - A unique constraint covering the columns `[dateModified]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "dateModified" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_dateModified_key" ON "users"("dateModified");
