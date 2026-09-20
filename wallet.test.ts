import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getWalletForUser: vi.fn().mockResolvedValue({ wallet: { id: 3, userId: 12, availableHalalas: 50000, heldHalalas: 0 }, ledger: [] }),
  holdWalletFunds: vi.fn().mockResolvedValue({ paymentHoldId: 18, amountHalalas: 12000, platformFeeBps: 1000, status: "held" }),
  releaseWalletFunds: vi.fn().mockResolvedValue({ paymentHoldId: 18, grossAmountHalalas: 12000, providerAmountHalalas: 10800, platformFeeHalalas: 1200, status: "released" }),
  createNotification: vi.fn().mockResolvedValue({ id: 1 }),
  addPaymentMethod: vi.fn().mockResolvedValue({ id: 4, provider: "apple_pay", label: "Apple Pay", status: "pending" }),
  addPayoutBankAccount: vi.fn().mockResolvedValue({ id: 5, bankName: "مصرف تجريبي", ibanLast4: "7519", verificationStatus: "pending" }),
  listPaymentMethodsForUser: vi.fn().mockResolvedValue([]),
  listPayoutBankAccountsForUser: vi.fn().mockResolvedValue([]),
  createWalletTopUpIntent: vi.fn().mockResolvedValue({ id: 6, status: "pending", amountHalalas: 10000 }),
  createPayoutRequest: vi.fn().mockResolvedValue({ id: 7, status: "pending", amountHalalas: 10000 }),
  getTermsStatus: vi.fn().mockResolvedValue({ accepted: true, termsVersion: "2026-09-v1", acceptedAt: new Date() }),
}));

vi.mock("./db", () => ({
  countUnreadNotifications: vi.fn(),
  createContract: vi.fn(),
  createMessage: vi.fn(),
  createNotification: mocks.createNotification,
  addPaymentMethod: mocks.addPaymentMethod,
  addPayoutBankAccount: mocks.addPayoutBankAccount,
  createServiceRequest: vi.fn(),
  getWalletForUser: mocks.getWalletForUser,
  listPaymentMethodsForUser: mocks.listPaymentMethodsForUser,
  listPayoutBankAccountsForUser: mocks.listPayoutBankAccountsForUser,
  holdWalletFunds: mocks.holdWalletFunds,
  listMessagesForRequest: vi.fn(),
  listNotificationsForUser: vi.fn(),
  listRequestsForUser: vi.fn(),
  markAllNotificationsRead: vi.fn(),
  markNotificationRead: vi.fn(),
  recordContactAgreement: vi.fn(),
  releaseWalletFunds: mocks.releaseWalletFunds,
  createWalletTopUpIntent: mocks.createWalletTopUpIntent,
  createPayoutRequest: mocks.createPayoutRequest,
  getTermsStatus: mocks.getTermsStatus,
}));

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createContext(user: TrpcContext["user"] = null): TrpcContext {
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

const user = { id: 12, openId: "wallet-user", name: "Wallet User", email: "wallet@example.com", loginMethod: "email", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };

describe("wallet escrow API", () => {
  it("returns a persisted wallet and ledger for the current user", async () => {
    const caller = appRouter.createCaller(createContext(user));
    const result = await caller.wallet.me();
    expect(result.wallet.userId).toBe(12);
    expect(mocks.getWalletForUser).toHaveBeenCalledWith(12);
  });

  it("holds the agreed service price and records a payment notification", async () => {
    const caller = appRouter.createCaller(createContext(user));
    const result = await caller.wallet.hold({ requestId: 42, amountHalalas: 12000, platformFeeBps: 1000 });
    expect(result.status).toBe("held");
    expect(mocks.holdWalletFunds).toHaveBeenCalledWith(12, 42, 12000, 1000);
    expect(mocks.createNotification).toHaveBeenCalledWith(expect.objectContaining({ type: "payment", userId: 12 }));
  });

  it("releases only after the authenticated client confirms completion", async () => {
    const caller = appRouter.createCaller(createContext(user));
    const result = await caller.wallet.release({ paymentHoldId: 18 });
    expect(result.providerAmountHalalas).toBe(10800);
    expect(mocks.releaseWalletFunds).toHaveBeenCalledWith(12, 18);
  });

  it("does not expose wallet mutations to anonymous visitors", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.wallet.hold({ requestId: 42, amountHalalas: 12000 })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("stores supported digital payment methods without storing secrets", async () => {
    const caller = appRouter.createCaller(createContext(user));
    await caller.wallet.addPaymentMethod({ provider: "apple_pay", label: "Apple Pay", isDefault: true });
    expect(mocks.addPaymentMethod).toHaveBeenCalledWith(expect.objectContaining({ userId: 12, provider: "apple_pay" }));
  });

  it("accepts a bank account form and keeps the payout request pending", async () => {
    const caller = appRouter.createCaller(createContext(user));
    await caller.wallet.addBankAccount({ bankName: "مصرف تجريبي", accountHolderName: "مستخدم نجدة", iban: "SA0380000000608010167519", isDefault: true });
    expect(mocks.addPayoutBankAccount).toHaveBeenCalledWith(expect.objectContaining({ userId: 12, bankName: "مصرف تجريبي" }));
    const result = await caller.wallet.requestPayout({ bankAccountId: 5, amountHalalas: 10000 });
    expect(result.status).toBe("pending");
  });
});
