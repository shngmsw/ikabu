-- CreateTable
CREATE TABLE "role" (
    "guild_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mention" TEXT NOT NULL,
    "member_count" INTEGER NOT NULL,
    "hex_color" TEXT NOT NULL,
    "position" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "unique_Role" (
    "guild_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    CONSTRAINT "unique_Role_guild_id_channel_id_fkey" FOREIGN KEY ("guild_id", "channel_id") REFERENCES "role" ("guild_id", "role_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "role_guild_id_role_id_key" ON "role"("guild_id", "role_id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_Role_guild_id_key_key" ON "unique_Role"("guild_id", "key");
