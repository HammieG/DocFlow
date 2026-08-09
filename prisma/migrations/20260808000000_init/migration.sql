CREATE TABLE "Document" (
  "id" TEXT NOT NULL PRIMARY KEY, "shareToken" TEXT NOT NULL, "title" TEXT NOT NULL,
  "type" TEXT NOT NULL, "rawText" TEXT NOT NULL, "formattedJson" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT', "signerName" TEXT, "signatureData" TEXT,
  "openedAt" DATETIME, "signedAt" DATETIME, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);
CREATE UNIQUE INDEX "Document_shareToken_key" ON "Document"("shareToken");
CREATE INDEX "Document_shareToken_idx" ON "Document"("shareToken");
