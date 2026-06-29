-- Migrate SavedArtwork from AIC-specific columns to source-neutral ones.
-- Existing saved rows reference the (now unreachable) Art Institute of Chicago
-- image host and have no Harvard equivalent, so we clear them along with the
-- board placements that depend on them. This is an intentional data reset.

-- Clear dependent placements first (FK to SavedArtwork), then saved rows.
DELETE FROM "BoardPlacement";
DELETE FROM "SavedArtwork";

-- Drop the old unique constraint and AIC-specific columns.
DROP INDEX "SavedArtwork_userId_aicId_key";
ALTER TABLE "SavedArtwork" DROP COLUMN "aicId";
ALTER TABLE "SavedArtwork" DROP COLUMN "imageId";

-- Add the source-neutral columns. Safe as NOT NULL because the table is now empty.
ALTER TABLE "SavedArtwork" ADD COLUMN "sourceId" INTEGER NOT NULL;
ALTER TABLE "SavedArtwork" ADD COLUMN "imageBase" TEXT NOT NULL;

-- Recreate the per-user uniqueness on the new id column.
CREATE UNIQUE INDEX "SavedArtwork_userId_sourceId_key" ON "SavedArtwork"("userId", "sourceId");
