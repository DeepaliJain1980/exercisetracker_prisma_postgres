/*
  Warnings:

  - The primary key for the `Exercise` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Exercise` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Exercise" DROP CONSTRAINT "Exercise_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD PRIMARY KEY ("id");
