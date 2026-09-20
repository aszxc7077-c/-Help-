import { describe, expect, it, vi } from "vitest";

vi.mock("./db", () => ({
  createContract: vi.fn(),
  createServiceRequest: vi.fn().mockResolvedValue({ id: 42, status: "searching" }),
  createNotification: vi.fn(),
  getTermsStatus: vi.fn().mockResolvedValue({ accepted: true, termsVersion: "2026-09-v1", acceptedAt: new Date() }),
  listRequestsForUser: vi.fn().mockResolvedValue([]),
  recordContactAgreement: vi.fn(),
}));

import { createServiceRequest } from "./db";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createContext(user: TrpcContext["user"] = {
  id: 12, openId: "terms-user", name: "Terms User", email: "terms@example.com", loginMethod: "email", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(), termsAcceptedAt: new Date(), termsVersion: "2026-09-v1",
}): TrpcContext {
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("serviceRequests.create", () => {
  it("stores an approximate location and never accepts the exact location field", async () => {
    const caller = appRouter.createCaller(createContext());

    const result = await caller.serviceRequests.create({
      serviceType: "tow",
      areaLabel: "الرياض، حي العليا",
      approximateLatitude: 24.7136,
      approximateLongitude: 46.6753,
      budgetMinHalalas: 8000,
      budgetMaxHalalas: 40000,
      exactLocation: "هذا الحقل يجب ألا يصل إلى قاعدة البيانات",
    } as never);

    expect(result).toEqual({ id: 42, status: "searching" });
    expect(createServiceRequest).toHaveBeenCalledWith(expect.objectContaining({
      serviceType: "tow",
      areaLabel: "الرياض، حي العليا",
      contactLocked: 1,
    }));
    expect(createServiceRequest.mock.calls[0]?.[0]).not.toHaveProperty("exactLocation");
  });

  it("rejects an invalid budget range type before writing", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.serviceRequests.create({
      serviceType: "tow",
      areaLabel: "الرياض",
      budgetMaxHalalas: "40000",
    } as never)).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
