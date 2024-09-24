/*
  Warnings:

  - A unique constraint covering the columns `[location]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "location" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_location_key" ON "users"("location");
