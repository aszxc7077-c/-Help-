import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getTermsStatus: vi.fn().mockResolvedValue({ accepted: false, termsVersion: "2026-09-v1", acceptedAt: null }),
  acceptPlatformTerms: vi.fn().mockResolvedValue({ accepted: true, termsVersion: "2026-09-v1", acceptedAt: new Date() }),
  createServiceRequest: vi.fn(),
}));

vi.mock("./db", () => ({
  getTermsStatus: mocks.getTermsStatus,
  acceptPlatformTerms: mocks.acceptPlatformTerms,
  createServiceRequest: mocks.createServiceRequest,
}));

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const user = { id: 12, openId: "terms-user", name: "Terms User", email: "terms@example.com", loginMethod: "email", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };
function createContext(): TrpcContext {
  return { user, req: { protocol: "https", headers: { "user-agent": "vitest" } } as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("platform terms", () => {
  it("returns the current terms status and records an explicit acceptance", async () => {
    const caller = appRouter.createCaller(createContext());
    expect((await caller.terms.status()).accepted).toBe(false);
    await caller.terms.accept({ accepted: true });
    expect(mocks.acceptPlatformTerms).toHaveBeenCalledWith(12, "vitest");
  });

  it("blocks service requests until the user accepts the platform terms", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.serviceRequests.create({ serviceType: "tow", areaLabel: "الرياض" })).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
    expect(mocks.createServiceRequest).not.toHaveBeenCalled();
  });
});
