import { describe, expect, it } from "vitest";
import { roomCodeFromScan } from "../scanCode";

describe("roomCodeFromScan", () => {
  it("reads invite links from any of our hosts", () => {
    expect(roomCodeFromScan("https://www.escape-escape.com/r/ADA-7K2Q")).toBe("ADA-7K2Q");
    expect(roomCodeFromScan("https://digital-escape-room-git-main.vercel.app/r/trn-ab12/")).toBe("TRN-AB12");
    expect(roomCodeFromScan("http://localhost:3000/r/ADA-7K2Q")).toBe("ADA-7K2Q");
  });

  it("reads old ?join= links and bare codes", () => {
    expect(roomCodeFromScan("https://www.escape-escape.com/?join=ADA-7K2Q")).toBe("ADA-7K2Q");
    expect(roomCodeFromScan("  ada-7k2q \n")).toBe("ADA-7K2Q");
  });

  it("ignores QR codes that aren't room invites", () => {
    expect(roomCodeFromScan("https://example.com/menu")).toBeNull();
    expect(roomCodeFromScan("https://www.escape-escape.com/r/ADA-7K2Q/extra")).toBeNull();
    expect(roomCodeFromScan("WIFI:S:Cafe;T:WPA;P:secret;;")).toBeNull();
    expect(roomCodeFromScan("javascript:alert(1)")).toBeNull();
    expect(roomCodeFromScan("")).toBeNull();
  });
});
