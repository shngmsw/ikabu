-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_member" (
    "guild_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "icon_url" TEXT NOT NULL,
    "joined_at" DATETIME,
    "is_rookie" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_member" ("display_name", "guild_id", "icon_url", "joined_at", "user_id") SELECT "display_name", "guild_id", "icon_url", "joined_at", "user_id" FROM "member";
DROP TABLE "member";
ALTER TABLE "new_member" RENAME TO "member";
CREATE UNIQUE INDEX "member_guild_id_user_id_key" ON "member"("guild_id", "user_id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
