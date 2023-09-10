-- CreateTable
CREATE TABLE "channel" (
    "guild_id" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "parent_id" TEXT,
    "is_vc_tools_enabled" BOOLEAN NOT NULL,
    "is_admin_channel" BOOLEAN NOT NULL
);

-- CreateTable
CREATE TABLE "unique_channel" (
    "guild_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    CONSTRAINT "unique_channel_guild_id_channel_id_fkey" FOREIGN KEY ("guild_id", "channel_id") REFERENCES "channel" ("guild_id", "channel_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "channel_guild_id_channel_id_key" ON "channel"("guild_id", "channel_id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_channel_guild_id_key_key" ON "unique_channel"("guild_id", "key");
