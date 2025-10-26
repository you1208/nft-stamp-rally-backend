-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "oauthProvider" TEXT NOT NULL,
    "oauthId" TEXT NOT NULL,
    "email" TEXT,
    "displayName" TEXT,
    "walletAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stamps" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "qrCode" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stamps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_stamps" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stampId" TEXT NOT NULL,
    "acquiredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_stamps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "composite_nfts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "backgroundStampId" TEXT NOT NULL,
    "characterStampId" TEXT NOT NULL,
    "compositeImageUrl" TEXT NOT NULL,
    "nftTokenId" TEXT,
    "nftTxHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "composite_nfts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_oauthId_key" ON "users"("oauthId");

-- CreateIndex
CREATE UNIQUE INDEX "users_oauthProvider_oauthId_key" ON "users"("oauthProvider", "oauthId");

-- CreateIndex
CREATE UNIQUE INDEX "stamps_qrCode_key" ON "stamps"("qrCode");

-- CreateIndex
CREATE UNIQUE INDEX "user_stamps_userId_stampId_key" ON "user_stamps"("userId", "stampId");

-- AddForeignKey
ALTER TABLE "user_stamps" ADD CONSTRAINT "user_stamps_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_stamps" ADD CONSTRAINT "user_stamps_stampId_fkey" FOREIGN KEY ("stampId") REFERENCES "stamps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "composite_nfts" ADD CONSTRAINT "composite_nfts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "composite_nfts" ADD CONSTRAINT "composite_nfts_backgroundStampId_fkey" FOREIGN KEY ("backgroundStampId") REFERENCES "stamps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "composite_nfts" ADD CONSTRAINT "composite_nfts_characterStampId_fkey" FOREIGN KEY ("characterStampId") REFERENCES "stamps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
