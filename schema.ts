import { decimal, index, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 32 }),
  passwordHash: varchar("passwordHash", { length: 220 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  termsAcceptedAt: timestamp("termsAcceptedAt"),
  termsVersion: varchar("termsVersion", { length: 24 }),
});

export const serviceProviders = mysqlTable("serviceProviders", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").references(() => users.id),
  businessName: varchar("businessName", { length: 180 }).notNull(),
  serviceType: varchar("serviceType", { length: 64 }).notNull(),
  description: text("description"),
  phone: varchar("phone", { length: 32 }),
  coverageArea: varchar("coverageArea", { length: 180 }),
  commercialRegistrationNumber: varchar("commercialRegistrationNumber", { length: 80 }),
  operatingCardNumber: varchar("operatingCardNumber", { length: 80 }),
  verificationStatus: mysqlEnum("verificationStatus", ["unverified", "pending", "verified", "rejected"]).default("unverified").notNull(),
  experiencePoints: int("experiencePoints").default(0).notNull(),
  priorityPoints: int("priorityPoints").default(0).notNull(),
  ratingCount: int("ratingCount").default(0).notNull(),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00").notNull(),
  status: mysqlEnum("status", ["pending", "approved", "paused"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  serviceTypeIdx: index("serviceProviders_serviceType_idx").on(table.serviceType),
  statusIdx: index("serviceProviders_status_idx").on(table.status),
}));

export const serviceRequests = mysqlTable("serviceRequests", {
  id: int("id").autoincrement().primaryKey(),
  requesterId: int("requesterId").references(() => users.id),
  providerId: int("providerId").references(() => serviceProviders.id),
  serviceType: varchar("serviceType", { length: 64 }).notNull(),
  status: mysqlEnum("status", ["searching", "offered", "accepted", "in_progress", "completed", "cancelled"]).default("searching").notNull(),
  areaLabel: varchar("areaLabel", { length: 180 }).notNull(),
  approximateLatitude: decimal("approximateLatitude", { precision: 10, scale: 7 }),
  approximateLongitude: decimal("approximateLongitude", { precision: 10, scale: 7 }),
  exactLocation: text("exactLocation"),
  budgetMinHalalas: int("budgetMinHalalas"),
  budgetMaxHalalas: int("budgetMaxHalalas"),
  contactLocked: int("contactLocked").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  requesterIdx: index("serviceRequests_requester_idx").on(table.requesterId),
  statusIdx: index("serviceRequests_status_idx").on(table.status),
}));

export const providerCustomFields = mysqlTable("providerCustomFields", {
  id: int("id").autoincrement().primaryKey(),
  providerId: int("providerId").notNull().references(() => serviceProviders.id),
  fieldLabel: varchar("fieldLabel", { length: 120 }).notNull(),
  fieldValue: text("fieldValue").notNull(),
  visibility: mysqlEnum("visibility", ["platform", "public"]).default("platform").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({ providerIdx: index("providerCustomFields_provider_idx").on(table.providerId) }));

export const serviceRatings = mysqlTable("serviceRatings", {
  id: int("id").autoincrement().primaryKey(),
  requestId: int("requestId").notNull().references(() => serviceRequests.id),
  providerId: int("providerId").notNull().references(() => serviceProviders.id),
  clientId: int("clientId").notNull().references(() => users.id),
  score: int("score").notNull(),
  comment: text("comment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({ providerIdx: index("serviceRatings_provider_idx").on(table.providerId), requestIdx: index("serviceRatings_request_idx").on(table.requestId) }));

export const contracts = mysqlTable("contracts", {
  id: int("id").autoincrement().primaryKey(),
  requestId: int("requestId").references(() => serviceRequests.id),
  providerId: int("providerId").references(() => serviceProviders.id),
  clientId: int("clientId").references(() => users.id),
  term: mysqlEnum("term", ["short", "long"]).notNull(),
  durationLabel: varchar("durationLabel", { length: 160 }).notNull(),
  coverageLabel: varchar("coverageLabel", { length: 180 }).notNull(),
  estimatedMinHalalas: int("estimatedMinHalalas").notNull(),
  estimatedMaxHalalas: int("estimatedMaxHalalas").notNull(),
  platformCommissionBps: int("platformCommissionBps").notNull(),
  status: mysqlEnum("status", ["draft", "pending_approval", "active", "completed", "cancelled"]).default("draft").notNull(),
  termsText: text("termsText"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  requestIdx: index("contracts_request_idx").on(table.requestId),
  statusIdx: index("contracts_status_idx").on(table.status),
}));

export const contactAgreements = mysqlTable("contactAgreements", {
  id: int("id").autoincrement().primaryKey(),
  requestId: int("requestId").notNull().references(() => serviceRequests.id),
  contractId: int("contractId").references(() => contracts.id),
  clientId: int("clientId").references(() => users.id),
  providerUserId: int("providerUserId").references(() => users.id),
  clientApprovedAt: timestamp("clientApprovedAt"),
  providerApprovedAt: timestamp("providerApprovedAt"),
  unlockedAt: timestamp("unlockedAt"),
  status: mysqlEnum("status", ["pending", "agreed", "revoked"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  requestIdx: index("contactAgreements_request_idx").on(table.requestId),
}));

export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  requestId: int("requestId").notNull().references(() => serviceRequests.id),
  senderId: int("senderId").notNull().references(() => users.id),
  body: text("body").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  requestIdx: index("messages_request_idx").on(table.requestId),
}));

export const paymentHolds = mysqlTable("paymentHolds", {
  id: int("id").autoincrement().primaryKey(),
  requestId: int("requestId").notNull().references(() => serviceRequests.id),
  contractId: int("contractId").references(() => contracts.id),
  payerId: int("payerId").references(() => users.id),
  providerId: int("providerId").references(() => serviceProviders.id),
  amountHalalas: int("amountHalalas").notNull(),
  platformFeeBps: int("platformFeeBps").notNull(),
  currency: varchar("currency", { length: 3 }).default("SAR").notNull(),
  status: mysqlEnum("status", ["pending", "held", "released", "refunded", "failed"]).default("pending").notNull(),
  heldAt: timestamp("heldAt"),
  releasedAt: timestamp("releasedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  requestIdx: index("paymentHolds_request_idx").on(table.requestId),
  statusIdx: index("paymentHolds_status_idx").on(table.status),
}));

export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  type: mysqlEnum("type", ["request", "payment", "message", "contract", "system"]).default("system").notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  body: text("body").notNull(),
  actionUrl: varchar("actionUrl", { length: 255 }),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("notifications_user_idx").on(table.userId),
  unreadIdx: index("notifications_unread_idx").on(table.userId, table.readAt),
}));

export const walletAccounts = mysqlTable("walletAccounts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id).unique(),
  availableHalalas: int("availableHalalas").default(0).notNull(),
  heldHalalas: int("heldHalalas").default(0).notNull(),
  currency: varchar("currency", { length: 3 }).default("SAR").notNull(),
  status: mysqlEnum("status", ["active", "frozen"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const walletLedger = mysqlTable("walletLedger", {
  id: int("id").autoincrement().primaryKey(),
  walletAccountId: int("walletAccountId").notNull().references(() => walletAccounts.id),
  requestId: int("requestId").references(() => serviceRequests.id),
  paymentHoldId: int("paymentHoldId").references(() => paymentHolds.id),
  type: mysqlEnum("type", ["top_up", "escrow_hold", "provider_release", "platform_fee", "refund"]).notNull(),
  direction: mysqlEnum("direction", ["credit", "debit"]).notNull(),
  amountHalalas: int("amountHalalas").notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  externalReference: varchar("externalReference", { length: 180 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  walletIdx: index("walletLedger_wallet_idx").on(table.walletAccountId),
  requestIdx: index("walletLedger_request_idx").on(table.requestId),
}));

export const paymentMethods = mysqlTable("paymentMethods", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  provider: mysqlEnum("provider", ["apple_pay", "mada", "stc_pay", "card", "bank_transfer"]).notNull(),
  label: varchar("label", { length: 120 }).notNull(),
  last4: varchar("last4", { length: 4 }),
  externalCustomerRef: varchar("externalCustomerRef", { length: 180 }),
  isDefault: int("isDefault").default(0).notNull(),
  status: mysqlEnum("status", ["pending", "verified", "disabled"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index("paymentMethods_user_idx").on(table.userId),
}));

export const payoutBankAccounts = mysqlTable("payoutBankAccounts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  bankName: varchar("bankName", { length: 120 }).notNull(),
  accountHolderName: varchar("accountHolderName", { length: 180 }).notNull(),
  ibanLast4: varchar("ibanLast4", { length: 4 }).notNull(),
  externalAccountRef: varchar("externalAccountRef", { length: 180 }),
  isDefault: int("isDefault").default(0).notNull(),
  verificationStatus: mysqlEnum("verificationStatus", ["pending", "verified", "rejected"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index("payoutBankAccounts_user_idx").on(table.userId),
}));

export const walletTopUps = mysqlTable("walletTopUps", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  paymentMethodId: int("paymentMethodId").references(() => paymentMethods.id),
  amountHalalas: int("amountHalalas").notNull(),
  currency: varchar("currency", { length: 3 }).default("SAR").notNull(),
  status: mysqlEnum("status", ["pending", "paid", "failed", "cancelled"]).default("pending").notNull(),
  externalReference: varchar("externalReference", { length: 180 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index("walletTopUps_user_idx").on(table.userId),
}));

export const payoutRequests = mysqlTable("payoutRequests", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  walletAccountId: int("walletAccountId").notNull().references(() => walletAccounts.id),
  bankAccountId: int("bankAccountId").notNull().references(() => payoutBankAccounts.id),
  amountHalalas: int("amountHalalas").notNull(),
  currency: varchar("currency", { length: 3 }).default("SAR").notNull(),
  status: mysqlEnum("status", ["pending", "processing", "paid", "failed", "cancelled"]).default("pending").notNull(),
  externalReference: varchar("externalReference", { length: 180 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index("payoutRequests_user_idx").on(table.userId),
  statusIdx: index("payoutRequests_status_idx").on(table.status),
}));

export const platformTermsAcceptances = mysqlTable("platformTermsAcceptances", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  termsVersion: varchar("termsVersion", { length: 24 }).notNull(),
  agreementType: mysqlEnum("agreementType", ["platform_conduct", "privacy", "provider_payout"]).notNull(),
  acceptedAt: timestamp("acceptedAt").defaultNow().notNull(),
  userAgent: varchar("userAgent", { length: 255 }),
}, (table) => ({
  userIdx: index("platformTermsAcceptances_user_idx").on(table.userId),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type ServiceProvider = typeof serviceProviders.$inferSelect;
export type InsertServiceProvider = typeof serviceProviders.$inferInsert;
export type ServiceRequest = typeof serviceRequests.$inferSelect;
export type InsertServiceRequest = typeof serviceRequests.$inferInsert;
export type ProviderCustomField = typeof providerCustomFields.$inferSelect;
export type ServiceRating = typeof serviceRatings.$inferSelect;
export type Contract = typeof contracts.$inferSelect;
export type InsertContract = typeof contracts.$inferInsert;
export type ContactAgreement = typeof contactAgreements.$inferSelect;
export type InsertContactAgreement = typeof contactAgreements.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type PaymentHold = typeof paymentHolds.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
export type WalletAccount = typeof walletAccounts.$inferSelect;
export type WalletLedgerEntry = typeof walletLedger.$inferSelect;
export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type PayoutBankAccount = typeof payoutBankAccounts.$inferSelect;
export type WalletTopUp = typeof walletTopUps.$inferSelect;
export type PayoutRequest = typeof payoutRequests.$inferSelect;
export type PlatformTermsAcceptance = typeof platformTermsAcceptances.$inferSelect;
