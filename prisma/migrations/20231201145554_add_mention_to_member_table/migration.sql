/*
  Warnings:

  - Added the required column `mention` to the `member` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_member" (
    "guild_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "mention" TEXT NOT NULL,
    "icon_url" TEXT NOT NULL,
    "joined_at" DATETIME,
    "is_rookie" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_member" 
    ("guild_id", "user_id", "display_name", "icon_url", "joined_at", "is_rookie", "mention")
SELECT 
    "guild_id", 
    "user_id", 
    "display_name", 
    "icon_url", 
    "joined_at", 
    "is_rookie",
    CASE 
        WHEN substr("user_id", 1, 8) = 'attendee' THEN ''
        ELSE '<@' || "user_id" || '>'
    END as "mention"
FROM "member";
DROP TABLE "member";
ALTER TABLE "new_member" RENAME TO "member";
CREATE UNIQUE INDEX "member_guild_id_user_id_key" ON "member"("guild_id", "user_id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
