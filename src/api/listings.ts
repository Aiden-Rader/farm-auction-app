import type { CreateListingInput, Listing } from "../types";

/**
 * Extracts the API error message from a failed response.
 *
 * @param {Response} res
 * @returns {Promise<string>}
 */
async function readError(res: Response): Promise<string> {
	const body = await res.json().catch(() => ({}));
	return body.error || body.detail || "Request failed";
}

/**
 * Loads listings from the server using the active search and category filters.
 *
 * @param {Object} [params]
 *		@param {string} [params.search]
 *		@param {string} [params.category]
 *		@param {AbortSignal} [params.signal]
 * @returns {Promise<Listing[]>}
 */
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

/**
 * Fetches a single listing for detail views.
 *
 * @param {string} id
 * @returns {Promise<Listing>}
 */
export async function getListing(id: string): Promise<Listing> {
	const res = await fetch(`/api/listings/${id}`);

	if (!res.ok) {
		throw new Error(await readError(res));
	}

	return res.json();
}

/**
 * Creates a listing through the server so IDs and defaults stay authoritative.
 *
 * @param {CreateListingInput} data
 * @returns {Promise<Listing>}
 */
export async function createListing(
	data: CreateListingInput,
): Promise<Listing> {
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

/**
 * Submits a bid and returns the updated listing from the backend.
 *
 * @param {string} listingId
 * @param {string} bidder
 * @param {number} amount
 * @returns {Promise<Listing>}
 */
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
