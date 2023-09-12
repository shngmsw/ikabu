-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_user_reaction" (
    "user_id" TEXT NOT NULL,
    "reaction_seq" INTEGER NOT NULL,
    "year" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    CONSTRAINT "user_reaction_reaction_seq_fkey" FOREIGN KEY ("reaction_seq") REFERENCES "reaction" ("reaction_seq") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_user_reaction" ("channel_id", "count", "reaction_seq", "user_id", "year") SELECT "channel_id", "count", "reaction_seq", "user_id", "year" FROM "user_reaction";
DROP TABLE "user_reaction";
ALTER TABLE "new_user_reaction" RENAME TO "user_reaction";
CREATE UNIQUE INDEX "user_reaction_user_id_reaction_seq_year_channel_id_key" ON "user_reaction"("user_id", "reaction_seq", "year", "channel_id");
CREATE TABLE "new_participant" (
    "guild_id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_type" INTEGER NOT NULL,
    "joined_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "participant_guild_id_user_id_fkey" FOREIGN KEY ("guild_id", "user_id") REFERENCES "member" ("guild_id", "user_id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_participant" ("guild_id", "joined_at", "message_id", "user_id", "user_type") SELECT "guild_id", "joined_at", "message_id", "user_id", "user_type" FROM "participant";
DROP TABLE "participant";
ALTER TABLE "new_participant" RENAME TO "participant";
CREATE UNIQUE INDEX "participant_guild_id_message_id_user_id_key" ON "participant"("guild_id", "message_id", "user_id");
CREATE TABLE "new_unique_Role" (
    "guild_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    CONSTRAINT "unique_Role_guild_id_channel_id_fkey" FOREIGN KEY ("guild_id", "channel_id") REFERENCES "role" ("guild_id", "role_id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_unique_Role" ("channel_id", "guild_id", "key") SELECT "channel_id", "guild_id", "key" FROM "unique_Role";
DROP TABLE "unique_Role";
ALTER TABLE "new_unique_Role" RENAME TO "unique_Role";
CREATE UNIQUE INDEX "unique_Role_guild_id_key_key" ON "unique_Role"("guild_id", "key");
CREATE TABLE "new_unique_channel" (
    "guild_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    CONSTRAINT "unique_channel_guild_id_channel_id_fkey" FOREIGN KEY ("guild_id", "channel_id") REFERENCES "channel" ("guild_id", "channel_id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_unique_channel" ("channel_id", "guild_id", "key") SELECT "channel_id", "guild_id", "key" FROM "unique_channel";
DROP TABLE "unique_channel";
ALTER TABLE "new_unique_channel" RENAME TO "unique_channel";
CREATE UNIQUE INDEX "unique_channel_guild_id_key_key" ON "unique_channel"("guild_id", "key");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
