/*
  Warnings:

  - You are about to drop the `composite_nfts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `stamps` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_stamps` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."composite_nfts" DROP CONSTRAINT "composite_nfts_backgroundStampId_fkey";

-- DropForeignKey
ALTER TABLE "public"."composite_nfts" DROP CONSTRAINT "composite_nfts_characterStampId_fkey";

-- DropForeignKey
ALTER TABLE "public"."composite_nfts" DROP CONSTRAINT "composite_nfts_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_stamps" DROP CONSTRAINT "user_stamps_stampId_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_stamps" DROP CONSTRAINT "user_stamps_userId_fkey";

-- DropTable
DROP TABLE "public"."composite_nfts";

-- DropTable
DROP TABLE "public"."stamps";

-- DropTable
DROP TABLE "public"."user_stamps";

-- DropTable
DROP TABLE "public"."users";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "oauthProvider" TEXT NOT NULL,
    "oauthId" TEXT NOT NULL,
    "email" TEXT,
    "displayName" TEXT,
    "walletAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stamp" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "qrCode" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Stamp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserStamp" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stampId" TEXT NOT NULL,
    "acquiredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserStamp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompositeNft" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "backgroundStampId" TEXT NOT NULL,
    "characterStampId" TEXT NOT NULL,
    "compositeImageUrl" TEXT NOT NULL,
    "nftTokenId" TEXT,
    "nftTxHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompositeNft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_oauthProvider_oauthId_key" ON "User"("oauthProvider", "oauthId");

-- CreateIndex
CREATE UNIQUE INDEX "Stamp_qrCode_key" ON "Stamp"("qrCode");

-- CreateIndex
CREATE UNIQUE INDEX "UserStamp_userId_stampId_key" ON "UserStamp"("userId", "stampId");

-- AddForeignKey
ALTER TABLE "UserStamp" ADD CONSTRAINT "UserStamp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserStamp" ADD CONSTRAINT "UserStamp_stampId_fkey" FOREIGN KEY ("stampId") REFERENCES "Stamp"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompositeNft" ADD CONSTRAINT "CompositeNft_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompositeNft" ADD CONSTRAINT "CompositeNft_backgroundStampId_fkey" FOREIGN KEY ("backgroundStampId") REFERENCES "Stamp"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompositeNft" ADD CONSTRAINT "CompositeNft_characterStampId_fkey" FOREIGN KEY ("characterStampId") REFERENCES "Stamp"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
