import { and, desc, eq, isNull, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import {
  InsertServiceRequest,
  InsertNotification,
  InsertUser,
  contactAgreements,
  contracts,
  notifications,
  messages,
  paymentMethods,
  paymentHolds,
  payoutBankAccounts,
  payoutRequests,
  platformTermsAcceptances,
  providerCustomFields,
  serviceRatings,
  serviceProviders,
  serviceRequests,
  users,
  walletAccounts,
  walletLedger,
  walletTopUps,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  for (const field of ["name", "email", "loginMethod"] as const) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  values.lastSignedIn = user.lastSignedIn ?? new Date();
  updateSet.lastSignedIn = values.lastSignedIn;
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export const CURRENT_TERMS_VERSION = "2026-09-v1";

function hashLocalPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyLocalPassword(password: string, stored: string) {
  const [salt, expectedHex] = stored.split(":");
  if (!salt || !expectedHex) return false;
  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHex, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function registerLocalUser(input: { email: string; name: string; phone: string; password: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const email = input.email.trim().toLowerCase();
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing[0]) throw new Error("البريد الإلكتروني مسجل مسبقًا");
  const now = new Date();
  const openId = `local_${createHash("sha256").update(email).digest("hex").slice(0, 48)}`;
  const result = await db.transaction(async (tx) => {
    const inserted = await tx.insert(users).values({
      openId,
      name: input.name.trim(),
      email,
      phone: input.phone.trim(),
      passwordHash: hashLocalPassword(input.password),
      loginMethod: "email",
      termsAcceptedAt: now,
      termsVersion: CURRENT_TERMS_VERSION,
      lastSignedIn: now,
    });
    await tx.insert(platformTermsAcceptances).values({
      userId: Number(inserted[0].insertId),
      termsVersion: CURRENT_TERMS_VERSION,
      agreementType: "platform_conduct",
      acceptedAt: now,
      userAgent: "local-email-registration",
    });
    return Number(inserted[0].insertId);
  });
  const rows = await db.select().from(users).where(eq(users.id, result)).limit(1);
  return rows[0];
}

export async function authenticateLocalUser(emailInput: string, password: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const email = emailInput.trim().toLowerCase();
  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const user = rows[0];
  if (!user?.passwordHash || !verifyLocalPassword(password, user.passwordHash)) {
    throw new Error("البريد الإلكتروني أو كلمة المرور غير صحيحة");
  }
  await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, user.id));
  return user;
}

export async function getTermsStatus(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const rows = await db.select({ termsAcceptedAt: users.termsAcceptedAt, termsVersion: users.termsVersion })
    .from(users).where(eq(users.id, userId)).limit(1);
  const user = rows[0];
  return {
    accepted: Boolean(user?.termsAcceptedAt && user.termsVersion === CURRENT_TERMS_VERSION),
    acceptedAt: user?.termsAcceptedAt ?? null,
    termsVersion: CURRENT_TERMS_VERSION,
  };
}

export async function acceptPlatformTerms(userId: number, userAgent?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const acceptedAt = new Date();
  await db.transaction(async (tx) => {
    await tx.update(users).set({ termsAcceptedAt: acceptedAt, termsVersion: CURRENT_TERMS_VERSION }).where(eq(users.id, userId));
    await tx.insert(platformTermsAcceptances).values({
      userId,
      termsVersion: CURRENT_TERMS_VERSION,
      agreementType: "platform_conduct",
      acceptedAt,
      userAgent: userAgent?.slice(0, 255),
    });
  });
  return { accepted: true as const, acceptedAt, termsVersion: CURRENT_TERMS_VERSION };
}

export async function createServiceRequest(input: InsertServiceRequest) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const result = await db.insert(serviceRequests).values(input);
  const id = Number(result[0].insertId);
  const rows = await db.select().from(serviceRequests).where(eq(serviceRequests.id, id)).limit(1);
  return rows[0];
}

export async function listRequestsForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(serviceRequests).where(eq(serviceRequests.requesterId, userId)).orderBy(desc(serviceRequests.createdAt));
}

export async function createContract(input: typeof contracts.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const result = await db.insert(contracts).values(input);
  const id = Number(result[0].insertId);
  const rows = await db.select().from(contracts).where(eq(contracts.id, id)).limit(1);
  return rows[0];
}

export async function recordContactAgreement(input: typeof contactAgreements.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const result = await db.insert(contactAgreements).values(input);
  const id = Number(result[0].insertId);
  const rows = await db.select().from(contactAgreements).where(eq(contactAgreements.id, id)).limit(1);
  return rows[0];
}

export async function listNotificationsForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(30);
}

export async function countUnreadNotifications(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const rows = await db.select({ id: notifications.id }).from(notifications)
    .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
  return rows.length;
}

export async function markNotificationRead(userId: number, notificationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));
  return { success: true } as const;
}

export async function markAllNotificationsRead(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
  return { success: true } as const;
}

async function assertRequestParticipant(userId: number, requestId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const rows = await db.select({ requestId: serviceRequests.id })
    .from(serviceRequests)
    .leftJoin(serviceProviders, eq(serviceProviders.id, serviceRequests.providerId))
    .where(and(
      eq(serviceRequests.id, requestId),
      or(eq(serviceRequests.requesterId, userId), eq(serviceProviders.ownerId, userId)),
    ))
    .limit(1);
  if (!rows[0]) throw new Error("You are not a participant in this request");
}

export async function listMessagesForRequest(userId: number, requestId: number) {
  const db = await getDb();
  if (!db) return [];
  await assertRequestParticipant(userId, requestId);
  const rows = await db.select({ message: messages })
    .from(messages)
    .where(eq(messages.requestId, requestId))
    .orderBy(messages.createdAt);
  return rows.map((row) => row.message);
}

export async function createMessage(userId: number, requestId: number, body: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await assertRequestParticipant(userId, requestId);
  const result = await db.insert(messages).values({ requestId, senderId: userId, body });
  const id = Number(result[0].insertId);
  const rows = await db.select().from(messages).where(eq(messages.id, id)).limit(1);
  return rows[0];
}

export async function createNotification(input: InsertNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const result = await db.insert(notifications).values(input);
  const id = Number(result[0].insertId);
  const rows = await db.select().from(notifications).where(eq(notifications.id, id)).limit(1);
  return rows[0];
}

async function ensureWallet(db: any, userId: number) {
  await db.insert(walletAccounts).values({ userId }).onDuplicateKeyUpdate({ set: { updatedAt: new Date() } });
  const rows = await db.select().from(walletAccounts).where(eq(walletAccounts.userId, userId)).limit(1);
  if (!rows[0]) throw new Error("Wallet could not be initialized");
  return rows[0];
}

export async function getWalletForUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const wallet = await ensureWallet(db, userId);
  const ledger = await db.select().from(walletLedger)
    .where(eq(walletLedger.walletAccountId, wallet.id))
    .orderBy(desc(walletLedger.createdAt))
    .limit(30);
  return { wallet, ledger };
}

export async function listPaymentMethodsForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(paymentMethods).where(eq(paymentMethods.userId, userId)).orderBy(desc(paymentMethods.createdAt));
}

export async function addPaymentMethod(input: {
  userId: number;
  provider: "apple_pay" | "mada" | "stc_pay" | "card" | "bank_transfer";
  label: string;
  last4?: string;
  externalCustomerRef?: string;
  isDefault?: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db.transaction(async (tx) => {
    if (input.isDefault) {
      await tx.update(paymentMethods).set({ isDefault: 0 }).where(eq(paymentMethods.userId, input.userId));
    }
    const result = await tx.insert(paymentMethods).values({
      userId: input.userId,
      provider: input.provider,
      label: input.label,
      last4: input.last4,
      externalCustomerRef: input.externalCustomerRef,
      isDefault: input.isDefault ? 1 : 0,
      status: "pending",
    });
    const rows = await tx.select().from(paymentMethods).where(eq(paymentMethods.id, Number(result[0].insertId))).limit(1);
    return rows[0];
  });
}

export async function listPayoutBankAccountsForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(payoutBankAccounts).where(eq(payoutBankAccounts.userId, userId)).orderBy(desc(payoutBankAccounts.createdAt));
}

export async function addPayoutBankAccount(input: {
  userId: number;
  bankName: string;
  accountHolderName: string;
  iban: string;
  externalAccountRef?: string;
  isDefault?: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const normalizedIban = input.iban.replace(/\s+/g, "").toUpperCase();
  if (!/^SA\d{22}$/.test(normalizedIban)) throw new Error("أدخل رقم IBAN سعودي صحيحًا");
  return db.transaction(async (tx) => {
    if (input.isDefault) {
      await tx.update(payoutBankAccounts).set({ isDefault: 0 }).where(eq(payoutBankAccounts.userId, input.userId));
    }
    const result = await tx.insert(payoutBankAccounts).values({
      userId: input.userId,
      bankName: input.bankName,
      accountHolderName: input.accountHolderName,
      ibanLast4: normalizedIban.slice(-4),
      externalAccountRef: input.externalAccountRef,
      isDefault: input.isDefault ? 1 : 0,
      verificationStatus: "pending",
    });
    const rows = await tx.select().from(payoutBankAccounts).where(eq(payoutBankAccounts.id, Number(result[0].insertId))).limit(1);
    return rows[0];
  });
}

export async function holdWalletFunds(userId: number, requestId: number, amountHalalas: number, platformFeeBps: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db.transaction(async (tx) => {
    const requestRows = await tx.select().from(serviceRequests)
      .where(and(eq(serviceRequests.id, requestId), eq(serviceRequests.requesterId, userId)))
      .limit(1);
    const request = requestRows[0];
    if (!request) throw new Error("Request not found or not owned by this user");
    if (["completed", "cancelled"].includes(request.status)) throw new Error("This request is no longer payable");
    if (!request.providerId) throw new Error("يجب اختيار مقدم خدمة قبل حجز المبلغ");
    const agreementRows = await tx.select().from(contactAgreements)
      .where(and(eq(contactAgreements.requestId, requestId), eq(contactAgreements.clientId, userId), eq(contactAgreements.status, "agreed")))
      .limit(1);
    if (!agreementRows[0]) throw new Error("يجب حفظ اتفاق الطرفين قبل حجز المبلغ");
    const wallet = await ensureWallet(tx, userId);
    if (wallet.status !== "active") throw new Error("Wallet is frozen");
    if (wallet.availableHalalas < amountHalalas) throw new Error("Insufficient wallet balance");
    await tx.update(walletAccounts).set({
      availableHalalas: sql`${walletAccounts.availableHalalas} - ${amountHalalas}`,
      heldHalalas: sql`${walletAccounts.heldHalalas} + ${amountHalalas}`,
    }).where(eq(walletAccounts.id, wallet.id));
    const inserted = await tx.insert(paymentHolds).values({
      requestId,
      contractId: null,
      payerId: userId,
      providerId: request.providerId,
      amountHalalas,
      platformFeeBps,
      currency: "SAR",
      status: "held",
      heldAt: new Date(),
    });
    const paymentHoldId = Number(inserted[0].insertId);
    await tx.insert(walletLedger).values({
      walletAccountId: wallet.id,
      requestId,
      paymentHoldId,
      type: "escrow_hold",
      direction: "debit",
      amountHalalas,
      description: "حجز مبلغ الخدمة في محفظة نجدة حتى تأكيد الإتمام",
    });
    await tx.update(serviceRequests).set({ status: "accepted" }).where(eq(serviceRequests.id, requestId));
    return { paymentHoldId, amountHalalas, platformFeeBps, status: "held" as const };
  });
}

export async function releaseWalletFunds(userId: number, paymentHoldId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db.transaction(async (tx) => {
    const holdRows = await tx.select().from(paymentHolds)
      .where(and(eq(paymentHolds.id, paymentHoldId), eq(paymentHolds.payerId, userId)))
      .limit(1);
    const hold = holdRows[0];
    if (!hold || hold.status !== "held") throw new Error("Payment hold is unavailable");
    if (!hold.providerId) throw new Error("A provider must be assigned before release");
    const providerRows = await tx.select().from(serviceProviders).where(eq(serviceProviders.id, hold.providerId)).limit(1);
    const provider = providerRows[0];
    if (!provider?.ownerId) throw new Error("Provider payout account is unavailable");
    const payerWallet = await ensureWallet(tx, userId);
    const providerWallet = await ensureWallet(tx, provider.ownerId);
    const platformFee = Math.floor((hold.amountHalalas * hold.platformFeeBps) / 10000);
    const providerAmount = hold.amountHalalas - platformFee;
    await tx.update(walletAccounts).set({
      heldHalalas: sql`${walletAccounts.heldHalalas} - ${hold.amountHalalas}`,
    }).where(eq(walletAccounts.id, payerWallet.id));
    await tx.update(walletAccounts).set({
      availableHalalas: sql`${walletAccounts.availableHalalas} + ${providerAmount}`,
    }).where(eq(walletAccounts.id, providerWallet.id));
    await tx.update(paymentHolds).set({ status: "released", releasedAt: new Date() }).where(eq(paymentHolds.id, paymentHoldId));
    await tx.update(serviceRequests).set({ status: "completed" }).where(eq(serviceRequests.id, hold.requestId));
    await tx.update(serviceProviders).set({
      experiencePoints: sql`${serviceProviders.experiencePoints} + 10`,
      priorityPoints: sql`${serviceProviders.priorityPoints} + 2`,
    }).where(eq(serviceProviders.id, hold.providerId));
    await tx.insert(walletLedger).values([
      { walletAccountId: payerWallet.id, requestId: hold.requestId, paymentHoldId, type: "provider_release", direction: "debit", amountHalalas: providerAmount, description: "تحرير صافي مبلغ الخدمة لمقدم الخدمة" },
      { walletAccountId: payerWallet.id, requestId: hold.requestId, paymentHoldId, type: "platform_fee", direction: "debit", amountHalalas: platformFee, description: "نسبة نجدة Help من الخدمة" },
      { walletAccountId: providerWallet.id, requestId: hold.requestId, paymentHoldId, type: "provider_release", direction: "credit", amountHalalas: providerAmount, description: "إيداع مستحقات الخدمة بعد الإتمام" },
    ]);
    return { paymentHoldId, grossAmountHalalas: hold.amountHalalas, providerAmountHalalas: providerAmount, platformFeeHalalas: platformFee, status: "released" as const };
  });
}

export async function createWalletTopUpIntent(userId: number, paymentMethodId: number, amountHalalas: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const methods = await db.select().from(paymentMethods)
    .where(and(eq(paymentMethods.id, paymentMethodId), eq(paymentMethods.userId, userId)))
    .limit(1);
  if (!methods[0]) throw new Error("Payment method not found");
  const result = await db.insert(walletTopUps).values({ userId, paymentMethodId, amountHalalas, currency: "SAR", status: "pending" });
  const rows = await db.select().from(walletTopUps).where(eq(walletTopUps.id, Number(result[0].insertId))).limit(1);
  return rows[0];
}

export async function createPayoutRequest(userId: number, bankAccountId: number, amountHalalas: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const wallet = await ensureWallet(db, userId);
  if (wallet.availableHalalas < amountHalalas) throw new Error("رصيد المحفظة المتاح غير كافٍ");
  const accounts = await db.select().from(payoutBankAccounts)
    .where(and(eq(payoutBankAccounts.id, bankAccountId), eq(payoutBankAccounts.userId, userId)))
    .limit(1);
  const account = accounts[0];
  if (!account) throw new Error("Bank account not found");
  if (account.verificationStatus !== "verified") throw new Error("يجب توثيق الحساب البنكي قبل طلب التحويل");
  const result = await db.insert(payoutRequests).values({ userId, walletAccountId: wallet.id, bankAccountId, amountHalalas, currency: "SAR", status: "pending" });
  const rows = await db.select().from(payoutRequests).where(eq(payoutRequests.id, Number(result[0].insertId))).limit(1);
  return rows[0];
}


export async function addProviderCustomField(ownerId: number, input: { label: string; value: string; visibility: "platform" | "public" }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const providers = await db.select({ id: serviceProviders.id }).from(serviceProviders).where(eq(serviceProviders.ownerId, ownerId)).limit(1);
  if (!providers[0]) throw new Error("Provider profile not found");
  const result = await db.insert(providerCustomFields).values({ providerId: providers[0].id, fieldLabel: input.label.trim(), fieldValue: input.value.trim(), visibility: input.visibility });
  return { id: Number(result[0].insertId), providerId: providers[0].id };
}

export async function createServiceRating(clientId: number, input: { requestId: number; score: number; comment?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db.transaction(async (tx) => {
    const requests = await tx.select().from(serviceRequests).where(and(eq(serviceRequests.id, input.requestId), eq(serviceRequests.requesterId, clientId))).limit(1);
    const request = requests[0];
    if (!request?.providerId || request.status !== "completed") throw new Error("لا يمكن التقييم قبل إتمام الخدمة");
    const existing = await tx.select({ id: serviceRatings.id }).from(serviceRatings).where(eq(serviceRatings.requestId, input.requestId)).limit(1);
    if (existing[0]) throw new Error("تم تقييم هذه الخدمة مسبقًا");
    await tx.insert(serviceRatings).values({ requestId: input.requestId, providerId: request.providerId, clientId, score: input.score, comment: input.comment?.trim() || null });
    const providerRows = await tx.select().from(serviceProviders).where(eq(serviceProviders.id, request.providerId)).limit(1);
    const provider = providerRows[0];
    const count = provider?.ratingCount ?? 0;
    const previous = Number(provider?.rating ?? 0);
    const rating = ((previous * count) + input.score) / (count + 1);
    await tx.update(serviceProviders).set({ rating: rating.toFixed(2), ratingCount: count + 1, experiencePoints: sql`${serviceProviders.experiencePoints} + ${input.score * 5}`, priorityPoints: sql`${serviceProviders.priorityPoints} + ${input.score >= 4 ? 3 : 0}` }).where(eq(serviceProviders.id, request.providerId));
    return { rating: rating.toFixed(2), experiencePointsAdded: input.score * 5 };
  });
}


export async function createProviderProfile(ownerId: number, input: { businessName: string; serviceType: string; phone: string; coverageArea: string; commercialRegistrationNumber?: string; operatingCardNumber?: string; }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const existing = await db.select({ id: serviceProviders.id }).from(serviceProviders).where(eq(serviceProviders.ownerId, ownerId)).limit(1);
  if (existing[0]) throw new Error("لديك ملف مقدم خدمة مسجل مسبقًا");
  const result = await db.insert(serviceProviders).values({ ...input, ownerId, status: "pending", verificationStatus: "pending" });
  return { id: Number(result[0].insertId), status: "pending" as const, verificationStatus: "pending" as const };
}
