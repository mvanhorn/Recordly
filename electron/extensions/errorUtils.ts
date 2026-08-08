export function getErrorMessage(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}

export function formatMarketplaceHttpError({
	status,
}: {
	status: number;
	contentType: string | null;
	body: string;
}): string {
	if (status >= 500) {
		return `Marketplace is temporarily unavailable (HTTP ${status}). Please try again later.`;
	}

	return `Marketplace request failed (HTTP ${status}).`;
}
