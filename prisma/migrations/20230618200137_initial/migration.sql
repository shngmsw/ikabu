-- CreateTable
CREATE TABLE "friend_code" (
    "user_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "url" TEXT
);

-- CreateTable
CREATE TABLE "member" (
    "guild_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "icon_url" TEXT NOT NULL,
    "joined_at" DATETIME
);

-- CreateTable
CREATE TABLE "message_count" (
    "user_id" TEXT NOT NULL,
    "count" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "participant" (
    "guild_id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_type" INTEGER NOT NULL,
    "joined_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "participant_guild_id_user_id_fkey" FOREIGN KEY ("guild_id", "user_id") REFERENCES "member" ("guild_id", "user_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_reaction" (
    "user_id" TEXT NOT NULL,
    "reaction_seq" INTEGER NOT NULL,
    "year" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    CONSTRAINT "user_reaction_reaction_seq_fkey" FOREIGN KEY ("reaction_seq") REFERENCES "reaction" ("reaction_seq") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "recruit" (
    "guild_id" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "recruit_num" INTEGER NOT NULL,
    "condition" TEXT NOT NULL DEFAULT 'なし',
    "vc_name" TEXT,
    "recruit_type" INTEGER NOT NULL,
    "option" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "sticky" (
    "guild_id" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "message_id" TEXT
);

-- CreateTable
CREATE TABLE "team_divider" (
    "message_id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "member_name" TEXT NOT NULL,
    "team" INTEGER NOT NULL,
    "match_num" INTEGER NOT NULL,
    "joined_match_count" INTEGER NOT NULL,
    "win" INTEGER NOT NULL,
    "force_spectate" BOOLEAN NOT NULL,
    "hide_win" BOOLEAN NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "reaction" (
    "reaction_seq" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "emoji_id" TEXT DEFAULT 'none',
    "emoji_name" TEXT NOT NULL,
    "count" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "friend_code_user_id_key" ON "friend_code"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "member_guild_id_user_id_key" ON "member"("guild_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "message_count_user_id_key" ON "message_count"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "participant_guild_id_message_id_user_id_key" ON "participant"("guild_id", "message_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_reaction_user_id_reaction_seq_year_channel_id_key" ON "user_reaction"("user_id", "reaction_seq", "year", "channel_id");

-- CreateIndex
CREATE UNIQUE INDEX "recruit_guild_id_message_id_key" ON "recruit"("guild_id", "message_id");

-- CreateIndex
CREATE UNIQUE INDEX "sticky_guild_id_channel_id_key" ON "sticky"("guild_id", "channel_id");

-- CreateIndex
CREATE UNIQUE INDEX "team_divider_message_id_member_id_match_num_key" ON "team_divider"("message_id", "member_id", "match_num");

-- CreateIndex
CREATE UNIQUE INDEX "reaction_emoji_id_emoji_name_key" ON "reaction"("emoji_id", "emoji_name");
