/*
  Warnings:

  - Added the required column `key` to the `sticky` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
DROP TABLE "sticky";
CREATE TABLE "sticky" (
    "guild_id" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "message_id" TEXT
);
CREATE UNIQUE INDEX "sticky_guild_id_channel_id_key_key" ON "sticky"("guild_id", "channel_id", "key");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
