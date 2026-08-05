import { afterEach, describe, expect, it, vi } from "vitest";
import { api, ApiRequestError, parseEmployeeId } from "./api";

describe("API client", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("does not add a JSON content type to GET requests", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await api.departments();

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(new Headers(init.headers).has("Content-Type")).toBe(false);
  });

  it("maps the backend validation array to field errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            code: "VALIDATION_FAILED",
            message: "Request validation failed",
            errors: [{ field: "email", message: "must be a well-formed email address" }],
          }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );

    const error = await api.createEmployee({
      fullName: "Aisha Tan",
      email: "invalid",
      departmentId: 1,
      jobTitle: "Engineer",
      status: "ACTIVE",
      joiningDate: "2024-01-01",
    }).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ApiRequestError);
    expect((error as ApiRequestError).fieldErrors.email).toContain("well-formed");
  });

  it("accepts only positive safe integer route identifiers", () => {
    expect(parseEmployeeId("12")).toBe(12);
    expect(parseEmployeeId("../12")).toBeNull();
    expect(parseEmployeeId("0")).toBeNull();
  });
});
