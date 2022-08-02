/*
  Warnings:

  - Added the required column `stripePublicKey` to the `Restaurant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stripeSecretKey` to the `Restaurant` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Restaurant" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "logo" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "description" TEXT,
    "password" TEXT NOT NULL,
    "minOrderAmount" REAL NOT NULL,
    "deliveryFee" REAL NOT NULL,
    "address1" TEXT NOT NULL,
    "address2" TEXT,
    "city" TEXT NOT NULL,
    "postcode" TEXT NOT NULL,
    "stripeSecretKey" TEXT NOT NULL,
    "stripePublicKey" TEXT NOT NULL
);
INSERT INTO "new_Restaurant" ("address1", "address2", "city", "createdAt", "deliveryFee", "description", "email", "id", "logo", "minOrderAmount", "name", "password", "postcode") SELECT "address1", "address2", "city", "createdAt", "deliveryFee", "description", "email", "id", "logo", "minOrderAmount", "name", "password", "postcode" FROM "Restaurant";
DROP TABLE "Restaurant";
ALTER TABLE "new_Restaurant" RENAME TO "Restaurant";
CREATE UNIQUE INDEX "Restaurant_email_key" ON "Restaurant"("email");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
