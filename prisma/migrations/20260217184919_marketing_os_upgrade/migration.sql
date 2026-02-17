-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "headshotUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "facebookToken" TEXT,
    "facebookPageId" TEXT,
    "instagramToken" TEXT,
    "instagramUserId" TEXT,
    "tokenExpires" DATETIME,
    "defaultPostingMode" TEXT NOT NULL DEFAULT 'company',
    "tonePreference" TEXT NOT NULL DEFAULT 'professional',
    "emojiLevel" TEXT NOT NULL DEFAULT 'moderate',
    "hashtagPack" TEXT,
    "platformPriority" TEXT NOT NULL DEFAULT 'both',
    "callToActionStyle" TEXT
);

-- CreateTable
CREATE TABLE "BrandingSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "companyName" TEXT NOT NULL DEFAULT 'Local Real Estate SA',
    "logoUrl" TEXT,
    "forSaleGraphic" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#f9b32d',
    "secondaryColor" TEXT NOT NULL DEFAULT '#003d51',
    "accentColor1" TEXT NOT NULL DEFAULT '#ea4b8b',
    "accentColor2" TEXT NOT NULL DEFAULT '#5dc2e8',
    "accentColor3" TEXT NOT NULL DEFAULT '#92c679',
    "tagline" TEXT NOT NULL DEFAULT 'MAKE YOUR NEXT MOVE A LOCAL ONE'
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "listingUrl" TEXT NOT NULL,
    "listingId" TEXT,
    "address" TEXT NOT NULL,
    "price" TEXT,
    "bedrooms" TEXT,
    "bathrooms" TEXT,
    "sqft" TEXT,
    "description" TEXT,
    "propertyType" TEXT,
    "suburb" TEXT,
    "priceRange" TEXT,
    "propertyImages" TEXT NOT NULL,
    "selectedImages" TEXT,
    "coverImageUrl" TEXT,
    "heroImageUrl" TEXT,
    "captions" TEXT NOT NULL,
    "selectedCaption" TEXT,
    "hashtags" TEXT,
    "agentId" TEXT,
    "agentName" TEXT,
    "agentPhone" TEXT,
    "agentPhoto" TEXT,
    "colorTheme" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "statusHistory" TEXT,
    "failureReason" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "postedTo" TEXT,
    "scheduledFor" DATETIME,
    "postedAt" DATETIME,
    "metaPostId" TEXT,
    "instagramPostId" TEXT,
    "facebookPostId" TEXT,
    "abTestVariant" TEXT,
    "abTestGroup" TEXT,
    "engagementStats" TEXT,
    "boosted" BOOLEAN NOT NULL DEFAULT false,
    "boostSpent" REAL,
    "whatsappApprovalSent" BOOLEAN NOT NULL DEFAULT false,
    "whatsappApprovedAt" DATETIME,
    "whatsappApprovedBy" TEXT,
    "metadata" TEXT,
    CONSTRAINT "Post_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ContentMemory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "postId" TEXT NOT NULL,
    "agentId" TEXT,
    "listingId" TEXT,
    "suburb" TEXT,
    "propertyType" TEXT,
    "priceRange" TEXT,
    "engagementScore" REAL NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "reach" INTEGER,
    "clicks" INTEGER,
    "inquiries" INTEGER NOT NULL DEFAULT 0,
    "hookStyle" TEXT,
    "captionLength" INTEGER,
    "emojiCount" INTEGER,
    "hashtagCount" INTEGER,
    "performanceNote" TEXT,
    CONSTRAINT "ContentMemory_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ContentMemory_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InsightPattern" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "suburb" TEXT NOT NULL DEFAULT '',
    "priceRange" TEXT NOT NULL DEFAULT '',
    "propertyType" TEXT NOT NULL DEFAULT '',
    "hookStyle" TEXT NOT NULL DEFAULT '',
    "avgEngagementScore" REAL NOT NULL,
    "sampleSize" INTEGER NOT NULL,
    "bestPerformingExample" TEXT,
    "recommendation" TEXT NOT NULL,
    "confidence" REAL NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "ABTest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "testType" TEXT NOT NULL,
    "variantA" TEXT NOT NULL,
    "variantB" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" DATETIME,
    "winningVariant" TEXT,
    "variantAEngagement" REAL,
    "variantBEngagement" REAL,
    "conclusion" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "ContentMemory_postId_key" ON "ContentMemory"("postId");

-- CreateIndex
CREATE INDEX "ContentMemory_suburb_priceRange_propertyType_idx" ON "ContentMemory"("suburb", "priceRange", "propertyType");

-- CreateIndex
CREATE INDEX "ContentMemory_engagementScore_idx" ON "ContentMemory"("engagementScore");

-- CreateIndex
CREATE INDEX "InsightPattern_suburb_priceRange_propertyType_idx" ON "InsightPattern"("suburb", "priceRange", "propertyType");

-- CreateIndex
CREATE UNIQUE INDEX "InsightPattern_suburb_priceRange_propertyType_hookStyle_key" ON "InsightPattern"("suburb", "priceRange", "propertyType", "hookStyle");
