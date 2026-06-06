-- CreateTable
CREATE TABLE "SavedArtwork" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "aicId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedArtwork_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SavedArtwork" ADD CONSTRAINT "SavedArtwork_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
