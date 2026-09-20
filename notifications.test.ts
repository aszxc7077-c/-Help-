import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  listNotificationsForUser: vi.fn().mockResolvedValue([
    { id: 7, userId: 12, type: "request", title: "تم قبول طلبك", body: "مقدم الخدمة في الطريق", readAt: null, createdAt: new Date() },
  ]),
  countUnreadNotifications: vi.fn().mockResolvedValue(1),
  markNotificationRead: vi.fn().mockResolvedValue({ success: true }),
  markAllNotificationsRead: vi.fn().mockResolvedValue({ success: true }),
  listMessagesForRequest: vi.fn().mockResolvedValue([
    { id: 9, requestId: 42, senderId: 12, body: "أنا في الطريق", createdAt: new Date() },
  ]),
  createMessage: vi.fn().mockResolvedValue({ id: 10, requestId: 42, senderId: 12, body: "وصلت", createdAt: new Date() }),
  getTermsStatus: vi.fn().mockResolvedValue({ accepted: true, termsVersion: "2026-09-v1", acceptedAt: new Date() }),
}));

vi.mock("./db", () => ({
  countUnreadNotifications: mocks.countUnreadNotifications,
  createContract: vi.fn(),
  createServiceRequest: vi.fn(),
  listNotificationsForUser: mocks.listNotificationsForUser,
  listMessagesForRequest: mocks.listMessagesForRequest,
  listRequestsForUser: vi.fn(),
  markAllNotificationsRead: mocks.markAllNotificationsRead,
  markNotificationRead: mocks.markNotificationRead,
  createMessage: mocks.createMessage,
  getTermsStatus: mocks.getTermsStatus,
  recordContactAgreement: vi.fn(),
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

const user = { id: 12, openId: "test-user", name: "Test", email: "test@example.com", loginMethod: "test", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };

describe("notifications API", () => {
  it("returns the authenticated user's notifications and unread count", async () => {
    const caller = appRouter.createCaller(createContext(user));
    const [items, unread] = await Promise.all([
      caller.notifications.list(),
      caller.notifications.unreadCount(),
    ]);
    expect(items).toHaveLength(1);
    expect(unread).toBe(1);
    expect(mocks.listNotificationsForUser).toHaveBeenCalledWith(12);
    expect(mocks.countUnreadNotifications).toHaveBeenCalledWith(12);
  });

  it("requires authentication before marking a notification read", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.notifications.markRead({ notificationId: 7 })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    expect(mocks.markNotificationRead).not.toHaveBeenCalled();
  });

  it("marks only the authenticated user's notification as read", async () => {
    const caller = appRouter.createCaller(createContext(user));
    await caller.notifications.markRead({ notificationId: 7 });
    expect(mocks.markNotificationRead).toHaveBeenCalledWith(12, 7);
  });

  it("keeps request chat behind the authenticated participant API", async () => {
    const caller = appRouter.createCaller(createContext(user));
    const messages = await caller.messages.list({ requestId: 42 });
    expect(messages[0]?.body).toBe("أنا في الطريق");
    await caller.messages.send({ requestId: 42, body: "وصلت" });
    expect(mocks.createMessage).toHaveBeenCalledWith(12, 42, "وصلت");
  });
});
