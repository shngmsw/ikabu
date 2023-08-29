-- CreateTable
CREATE TABLE "recruit_count" (
    "user_id" TEXT NOT NULL,
    "recruit_count" INTEGER NOT NULL,
    "join_count" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "voice_count" (
    "user_id" TEXT NOT NULL,
    "start_time" DATETIME,
    "total_sec" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "recruit_count_user_id_key" ON "recruit_count"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "voice_count_user_id_key" ON "voice_count"("user_id");
