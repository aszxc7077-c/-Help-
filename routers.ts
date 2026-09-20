import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { sdk } from "./_core/sdk";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  countUnreadNotifications,
  createNotification,
  createContract,
  createServiceRequest,
  listNotificationsForUser,
  listMessagesForRequest,
  listRequestsForUser,
  markAllNotificationsRead,
  markNotificationRead,
  createMessage,
  getWalletForUser,
  listPaymentMethodsForUser,
  addPaymentMethod,
  listPayoutBankAccountsForUser,
  addPayoutBankAccount,
  createWalletTopUpIntent,
  createPayoutRequest,
  holdWalletFunds,
  releaseWalletFunds,
  recordContactAgreement,
  getTermsStatus,
  acceptPlatformTerms,
  CURRENT_TERMS_VERSION,
  registerLocalUser,
  authenticateLocalUser,
  addProviderCustomField,
  createServiceRating,
  createProviderProfile,
} from "./db";

const termsAcceptedProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const status = await getTermsStatus(ctx.user.id);
  if (!status.accepted) {
    throw new TRPCError({ code: "PRECONDITION_FAILED", message: "يجب الموافقة على شروط التعامل داخل منصة نجدة أولًا" });
  }
  return next();
});

function safeUser(user: NonNullable<import("../drizzle/schema").User>) {
  const { passwordHash: _passwordHash, phone: _phone, ...safe } = user;
  return safe;
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user ? safeUser(opts.ctx.user) : null),
    register: publicProcedure
      .input(z.object({
        email: z.string().email().max(320),
        name: z.string().trim().min(2).max(120),
        phone: z.string().trim().regex(/^\+?[0-9\s()-]{8,20}$/),
        password: z.string().min(8).max(128),
        acceptedTerms: z.literal(true),
      }))
      .mutation(async ({ input, ctx }) => {
        const user = await registerLocalUser(input);
        const token = await sdk.createSessionToken(user.openId, { name: user.name ?? "" });
        ctx.res.cookie(COOKIE_NAME, token, { ...getSessionCookieOptions(ctx.req), maxAge: 365 * 24 * 60 * 60 * 1000 });
        return safeUser(user);
      }),
    login: publicProcedure
      .input(z.object({ email: z.string().email().max(320), password: z.string().min(8).max(128) }))
      .mutation(async ({ input, ctx }) => {
        const user = await authenticateLocalUser(input.email, input.password);
        const token = await sdk.createSessionToken(user.openId, { name: user.name ?? "" });
        ctx.res.cookie(COOKIE_NAME, token, { ...getSessionCookieOptions(ctx.req), maxAge: 365 * 24 * 60 * 60 * 1000 });
        return safeUser(user);
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  terms: router({
    status: protectedProcedure.query(({ ctx }) => getTermsStatus(ctx.user.id)),
    accept: protectedProcedure
      .input(z.object({ accepted: z.literal(true) }))
      .mutation(({ ctx }) => {
        const userAgent = typeof ctx.req.headers["user-agent"] === "string" ? ctx.req.headers["user-agent"] : undefined;
        return acceptPlatformTerms(ctx.user.id, userAgent);
      }),
    version: publicProcedure.query(() => ({ version: CURRENT_TERMS_VERSION })),
  }),
  serviceRequests: router({
    create: termsAcceptedProcedure
      .input(z.object({
        serviceType: z.string().min(1).max(64),
        areaLabel: z.string().min(1).max(180),
        approximateLatitude: z.number().min(-90).max(90).optional(),
        approximateLongitude: z.number().min(-180).max(180).optional(),
        budgetMinHalalas: z.number().int().nonnegative().optional(),
        budgetMaxHalalas: z.number().int().nonnegative().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const request = await createServiceRequest({
          requesterId: ctx.user.id,
          serviceType: input.serviceType,
          status: "searching",
          areaLabel: input.areaLabel,
          approximateLatitude: input.approximateLatitude?.toString(),
          approximateLongitude: input.approximateLongitude?.toString(),
          budgetMinHalalas: input.budgetMinHalalas,
          budgetMaxHalalas: input.budgetMaxHalalas,
          contactLocked: 1,
        });
        if (ctx.user && request) {
          await createNotification({
            userId: ctx.user.id,
            type: "request",
            title: "تم حفظ طلب المساعدة",
            body: "سنبدأ مطابقة طلبك مع مقدمي الخدمة الأقرب إليك.",
            actionUrl: "#tracking",
          });
        }
        return request;
      }),
    mine: termsAcceptedProcedure.query(({ ctx }) => listRequestsForUser(ctx.user.id)),
  }),
  contracts: router({
    create: termsAcceptedProcedure
      .input(z.object({
        requestId: z.number().int().positive().optional(),
        providerId: z.number().int().positive().optional(),
        term: z.enum(["short", "long"]),
        durationLabel: z.string().min(1).max(160),
        coverageLabel: z.string().min(1).max(180),
        estimatedMinHalalas: z.number().int().nonnegative(),
        estimatedMaxHalalas: z.number().int().nonnegative(),
        platformCommissionBps: z.number().int().min(0).max(10000),
        termsText: z.string().max(10000).optional(),
      }))
      .mutation(({ input, ctx }) => createContract({
        requestId: input.requestId,
        providerId: input.providerId,
        clientId: ctx.user.id,
        term: input.term,
        durationLabel: input.durationLabel,
        coverageLabel: input.coverageLabel,
        estimatedMinHalalas: input.estimatedMinHalalas,
        estimatedMaxHalalas: input.estimatedMaxHalalas,
        platformCommissionBps: input.platformCommissionBps,
        status: "draft",
        termsText: input.termsText,
      })),
  }),
  contactAgreements: router({
    record: termsAcceptedProcedure
      .input(z.object({
        requestId: z.number().int().positive(),
        contractId: z.number().int().positive().optional(),
        providerUserId: z.number().int().positive().optional(),
        status: z.enum(["pending", "agreed"]).default("pending"),
      }))
      .mutation(({ input, ctx }) => recordContactAgreement({
        requestId: input.requestId,
        contractId: input.contractId,
        clientId: ctx.user.id,
        providerUserId: input.providerUserId,
        status: input.status,
        clientApprovedAt: input.status === "agreed" ? new Date() : undefined,
      })),
  }),
  providers: router({
    create: termsAcceptedProcedure
      .input(z.object({ businessName: z.string().trim().min(2).max(180), serviceType: z.string().trim().min(2).max(64), phone: z.string().trim().regex(/^\+?[0-9\s()-]{8,20}$/), coverageArea: z.string().trim().min(2).max(180), commercialRegistrationNumber: z.string().trim().max(80).optional(), operatingCardNumber: z.string().trim().max(80).optional() }))
      .mutation(({ input, ctx }) => createProviderProfile(ctx.user.id, input)),
    addCustomField: termsAcceptedProcedure
      .input(z.object({ label: z.string().trim().min(2).max(120), value: z.string().trim().min(1).max(2000), visibility: z.enum(["platform", "public"]) }))
      .mutation(({ input, ctx }) => addProviderCustomField(ctx.user.id, input)),
  }),
  ratings: router({
    create: termsAcceptedProcedure
      .input(z.object({ requestId: z.number().int().positive(), score: z.number().int().min(1).max(5), comment: z.string().max(2000).optional() }))
      .mutation(({ input, ctx }) => createServiceRating(ctx.user.id, input)),
  }),
  notifications: router({
    list: termsAcceptedProcedure.query(({ ctx }) => listNotificationsForUser(ctx.user.id)),
    unreadCount: termsAcceptedProcedure.query(({ ctx }) => countUnreadNotifications(ctx.user.id)),
    markRead: termsAcceptedProcedure
      .input(z.object({ notificationId: z.number().int().positive() }))
      .mutation(({ input, ctx }) => markNotificationRead(ctx.user.id, input.notificationId)),
    markAllRead: termsAcceptedProcedure.mutation(({ ctx }) => markAllNotificationsRead(ctx.user.id)),
  }),
  messages: router({
    list: termsAcceptedProcedure
      .input(z.object({ requestId: z.number().int().positive() }))
      .query(({ input, ctx }) => listMessagesForRequest(ctx.user.id, input.requestId)),
    send: termsAcceptedProcedure
      .input(z.object({ requestId: z.number().int().positive(), body: z.string().trim().min(1).max(2000) }))
      .mutation(({ input, ctx }) => createMessage(ctx.user.id, input.requestId, input.body)),
  }),
  wallet: router({
    me: termsAcceptedProcedure.query(({ ctx }) => getWalletForUser(ctx.user.id)),
    paymentMethods: termsAcceptedProcedure.query(({ ctx }) => listPaymentMethodsForUser(ctx.user.id)),
    bankAccounts: termsAcceptedProcedure.query(({ ctx }) => listPayoutBankAccountsForUser(ctx.user.id)),
    addPaymentMethod: termsAcceptedProcedure
      .input(z.object({
        provider: z.enum(["apple_pay", "mada", "stc_pay", "card", "bank_transfer"]),
        label: z.string().min(2).max(120),
        last4: z.string().regex(/^\d{4}$/).optional(),
        externalCustomerRef: z.string().max(180).optional(),
        isDefault: z.boolean().default(false),
      }))
      .mutation(({ input, ctx }) => addPaymentMethod({ ...input, userId: ctx.user.id })),
    addBankAccount: termsAcceptedProcedure
      .input(z.object({
        bankName: z.string().min(2).max(120),
        accountHolderName: z.string().min(2).max(180),
        iban: z.string().min(15).max(34),
        externalAccountRef: z.string().max(180).optional(),
        isDefault: z.boolean().default(false),
      }))
      .mutation(({ input, ctx }) => addPayoutBankAccount({ ...input, userId: ctx.user.id })),
    createTopUpIntent: termsAcceptedProcedure
      .input(z.object({ paymentMethodId: z.number().int().positive(), amountHalalas: z.number().int().positive().max(100_000_000_00) }))
      .mutation(({ input, ctx }) => createWalletTopUpIntent(ctx.user.id, input.paymentMethodId, input.amountHalalas)),
    requestPayout: termsAcceptedProcedure
      .input(z.object({ bankAccountId: z.number().int().positive(), amountHalalas: z.number().int().positive() }))
      .mutation(({ input, ctx }) => createPayoutRequest(ctx.user.id, input.bankAccountId, input.amountHalalas)),
    hold: termsAcceptedProcedure
      .input(z.object({
        requestId: z.number().int().positive(),
        amountHalalas: z.number().int().positive().max(100_000_000_00),
        platformFeeBps: z.number().int().min(0).max(10000).default(1000),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await holdWalletFunds(ctx.user.id, input.requestId, input.amountHalalas, input.platformFeeBps);
        await createNotification({
          userId: ctx.user.id,
          type: "payment",
          title: "تم حجز مبلغ الخدمة",
          body: "المبلغ محفوظ في محفظة نجدة ولن يُحوّل إلا بعد تأكيد إتمام العمل.",
          actionUrl: "#tracking",
        });
        return result;
      }),
    release: termsAcceptedProcedure
      .input(z.object({ paymentHoldId: z.number().int().positive() }))
      .mutation(async ({ input, ctx }) => {
        const result = await releaseWalletFunds(ctx.user.id, input.paymentHoldId);
        await createNotification({
          userId: ctx.user.id,
          type: "payment",
          title: "تم تأكيد إتمام الخدمة",
          body: "تم احتساب نسبة نجدة وتحرير صافي المستحق لمقدم الخدمة.",
          actionUrl: "#tracking",
        });
        return result;
      }),
  }),
});

export type AppRouter = typeof appRouter;
