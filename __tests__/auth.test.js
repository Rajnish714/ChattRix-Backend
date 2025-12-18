import request from "supertest";
import { jest } from "@jest/globals";

/**
 * 1️⃣ MOCK OTP SERVICE (ESM-SAFE)
 */
await jest.unstable_mockModule("../src/services/otp.services.js", () => ({
  sendOTP: jest.fn(),
  verifyOTPService: jest.fn()
}));

/**
 * 2️⃣ IMPORT AFTER MOCKS
 */
const otpService = await import("../src/services/otp.services.js");
const app = (await import("../app.js")).default;
const { User } = await import("../src/models/user.model.js");

/**
 * 3️⃣ TESTS
 */
describe("Auth flow (OTP session based)", () => {
  it("POST /v1/auth/signup → returns otpSession", async () => {
    otpService.sendOTP.mockResolvedValue({
      otpSession: "otp-session-123"
    });

    const res = await request(app)
      .post("/v1/auth/signup")
      .send({
        username: "testuser",
        email: "test@test.com",
        password: "Password123!"
      });

    expect(res.status).toBe(200);
    expect(res.body.otpSession).toBe("otp-session-123");
  });

  it("POST /v1/auth/verify-otp → creates user", async () => {
    otpService.verifyOTPService.mockResolvedValue({
      email: "test@test.com",
      type: "register",
      signupData: {
        username: "testuser",
        passwordHash: "$2b$10$hashedpassword"
      }
    });

    const res = await request(app)
      .post("/v1/auth/verify-otp")
      .send({
        otp: "123456",
        otpSession: "otp-session-123"
      });

    expect(res.status).toBe(200);

    const user = await User.findOne({ email: "test@test.com" });
    expect(user).not.toBeNull();
    expect(user.username).toBe("testuser");
  });
});
