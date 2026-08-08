import { describe, expect, it } from "vitest";

import { formatMarketplaceHttpError } from "./errorUtils";

describe("formatMarketplaceHttpError", () => {
	it("hides upstream HTML when the marketplace is unavailable", () => {
		const html = "<!DOCTYPE html><html><body>SSL handshake failed</body></html>";

		const message = formatMarketplaceHttpError({
			status: 525,
			contentType: "text/html; charset=UTF-8",
			body: html,
		});

		expect(message).toBe(
			"Marketplace is temporarily unavailable (HTTP 525). Please try again later.",
		);
		expect(message).not.toContain("SSL handshake failed");
	});

	it("hides JSON errors for client-side request failures", () => {
		const detail = "Invalid search query";
		const message = formatMarketplaceHttpError({
			status: 400,
			contentType: "application/json",
			body: JSON.stringify({ error: detail }),
		});

		expect(message).toBe("Marketplace request failed (HTTP 400).");
		expect(message).not.toContain(detail);
	});

	it("hides JSON messages when an error field is absent", () => {
		const detail = "Extension version already exists";
		const message = formatMarketplaceHttpError({
			status: 409,
			contentType: "application/json",
			body: JSON.stringify({ message: detail }),
		});

		expect(message).toBe("Marketplace request failed (HTTP 409).");
		expect(message).not.toContain(detail);
	});

	it("hides malformed JSON bodies", () => {
		const body = '{"error":"internal route details"';
		const message = formatMarketplaceHttpError({
			status: 400,
			contentType: "application/json",
			body,
		});

		expect(message).toBe("Marketplace request failed (HTTP 400).");
		expect(message).not.toContain(body);
	});

	it("hides long Unicode details from alternate JSON content types", () => {
		const detail = `🚀${"x".repeat(200)}`;
		const message = formatMarketplaceHttpError({
			status: 400,
			contentType: "application/problem+json",
			body: JSON.stringify({ error: detail }),
		});

		expect(message).toBe("Marketplace request failed (HTTP 400).");
		expect(message).not.toContain(detail);
	});

	it("does not expose non-JSON response bodies", () => {
		const body = "internal route details";
		const message = formatMarketplaceHttpError({
			status: 404,
			contentType: "text/plain",
			body,
		});

		expect(message).toBe("Marketplace request failed (HTTP 404).");
		expect(message).not.toContain(body);
	});
});
