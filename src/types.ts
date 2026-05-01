export const listingCategories = [
	"tractor",
	"combine",
	"implement",
	"attachment",
] as const;

export type ListingCategory = (typeof listingCategories)[number];
export type ListingStatus = "active" | "closed" | "pending";

export interface Listing {
	id: string;
	title: string;
	description: string;
	category: ListingCategory;
	startingPrice: number;
	currentBid: number;
	currentBidder: string | null;
	status: ListingStatus;
	endsAt: string;
	imageUrl: string;
}

export interface CreateListingInput {
	title: string;
	description: string;
	category: ListingCategory;
	startingPrice: number;
	imageUrl: string;
}
