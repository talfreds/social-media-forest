-- Production Migration Script
-- Run this on your production database before deploying

-- Add deletedAt column to comments table
ALTER TABLE "Comment" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- Create index for better query performance
CREATE INDEX "Comment_deletedAt_idx" ON "Comment"("deletedAt");

-- Update existing comments to have null deletedAt (they're not deleted)
UPDATE "Comment" SET "deletedAt" = NULL WHERE "deletedAt" IS NULL;
