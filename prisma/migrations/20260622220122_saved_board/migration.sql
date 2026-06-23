/*
  Warnings:

  - A unique constraint covering the columns `[userId,aicId]` on the table `SavedArtwork` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "Board" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Board_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoardPlacement" (
    "id" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "savedId" TEXT NOT NULL,
    "x" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "y" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "width" DOUBLE PRECISION NOT NULL DEFAULT 240,
    "height" DOUBLE PRECISION NOT NULL DEFAULT 240,
    "z" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "BoardPlacement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Board_userId_idx" ON "Board"("userId");

-- CreateIndex
CREATE INDEX "BoardPlacement_boardId_idx" ON "BoardPlacement"("boardId");

-- CreateIndex
CREATE INDEX "BoardPlacement_savedId_idx" ON "BoardPlacement"("savedId");

-- CreateIndex
CREATE INDEX "SavedArtwork_userId_idx" ON "SavedArtwork"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedArtwork_userId_aicId_key" ON "SavedArtwork"("userId", "aicId");

-- AddForeignKey
ALTER TABLE "Board" ADD CONSTRAINT "Board_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardPlacement" ADD CONSTRAINT "BoardPlacement_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardPlacement" ADD CONSTRAINT "BoardPlacement_savedId_fkey" FOREIGN KEY ("savedId") REFERENCES "SavedArtwork"("id") ON DELETE CASCADE ON UPDATE CASCADE;
