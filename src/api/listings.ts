import type { CreateListingInput, Listing } from "../types";

async function readError(res: Response): Promise<string> {
	const body = await res.json().catch(() => ({}));
	return body.error || body.detail || "Request failed";
}

export async function getListings(params?: {
	search?: string;
	category?: string;
	signal?: AbortSignal;
}): Promise<Listing[]> {
	const url = new URL("/api/listings", window.location.origin);

	if (params?.search) {
		url.searchParams.set("search", params.search);
	}
	if (params?.category && params.category !== "all") {
		url.searchParams.set("category", params.category);
	}

	const res = await fetch(url, { signal: params?.signal });

	if (!res.ok) {
		throw new Error(await readError(res));
	}

	return res.json();
}

export async function getListing(id: string): Promise<Listing> {
	const res = await fetch(`/api/listings/${id}`);

	if (!res.ok) {
		throw new Error(await readError(res));
	}

	return res.json();
}

export async function createListing(data: CreateListingInput): Promise<Listing> {
	const res = await fetch("/api/listings", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	});

	if (!res.ok) {
		throw new Error(await readError(res));
	}

	return res.json();
}

export async function placeBid(
	listingId: string,
	bidder: string,
	amount: number,
): Promise<Listing> {
	const res = await fetch(`/api/listings/${listingId}/bids`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ bidder, amount }),
	});

	if (!res.ok) {
		throw new Error(await readError(res));
	}

	return res.json();
}
