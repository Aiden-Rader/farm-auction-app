import { useEffect, useState } from "react";
import { getListings } from "./api/listings";
import CreateListingForm from "./components/CreateListingForm";
import ListingCard from "./components/ListingCard";
import ListingDetail from "./components/ListingDetail";
import { type Listing, type ListingCategory, listingCategories } from "./types";

/**
 * Coordinates listing loading, filtering, bidding, and the create-listing modal.
 */
export default function App() {
	const [listings, setListings] = useState<Listing[]>([]);
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [categoryFilter, setCategoryFilter] = useState<ListingCategory | "all">(
		"all",
	);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	/**
	 * Refetches listings whenever the active filters change.
	 */
	useEffect(() => {
		const controller = new AbortController();

		setLoading(true);
		setError(null);

		getListings({
			search: searchTerm,
			category: categoryFilter,
			signal: controller.signal,
		})
			.then((data) => setListings(data))
			.catch((err) => {
				if (err instanceof Error && err.name === "AbortError") {
					return;
				}

				setError(
					err instanceof Error ? err.message : "Failed to load listings",
				);
			})
			.finally(() => {
				if (!controller.signal.aborted) {
					setLoading(false);
				}
			});

		return () => controller.abort();
	}, [searchTerm, categoryFilter]);

	const selectedListing = listings.find((l) => l.id === selectedId) ?? null;

	/**
	 * Replaces the updated listing in local state after a successful bid.
	 *
	 * @param {Listing} updated
	 * @returns {void}
	 */
	const handleBidSuccess = (updated: Listing) => {
		setListings((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
	};

	/**
	 * Refreshes the current filtered result set from the backend.
	 *
	 * @returns {Promise<Listing[]>}
	 */
	const refreshListings = async () => {
		const data = await getListings({
			search: searchTerm,
			category: categoryFilter,
		});
		setListings(data);
		return data;
	};

	/**
	 * Closes the modal, then reloads listings so the new item appears in the filtered view.
	 *
	 * @param {Listing} listing
	 * @returns {Promise<void>}
	 */
	const handleListingCreated = async (listing: Listing) => {
		const normalizedSearch = searchTerm.trim().toLowerCase();
		const matchesSearch =
			normalizedSearch === "" ||
			listing.title.toLowerCase().includes(normalizedSearch) ||
			listing.description.toLowerCase().includes(normalizedSearch);
		const matchesCategory =
			categoryFilter === "all" || listing.category === categoryFilter;

		setSelectedId(matchesSearch && matchesCategory ? listing.id : null);
		setShowCreateForm(false);
		await refreshListings();
	};

	/**
	 * Closes the create-listing modal without changing the current filters.
	 *
	 * @returns {void}
	 */
	const closeCreateModal = () => {
		setShowCreateForm(false);
	};

	/**
	 * Locks background scroll and lets Escape close the modal.
	 *
	 * @returns {void}
	 */
	useEffect(() => {
		if (!showCreateForm) return;

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setShowCreateForm(false);
			}
		};

		document.body.classList.add("body--modal-open");
		window.addEventListener("keydown", handleKeyDown);

		return () => {
			document.body.classList.remove("body--modal-open");
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [showCreateForm]);

	return (
		<div className="app">
			<header className="app-header">
				<h1>Interview Auctions</h1>
				<p className="app-header__subtitle">Farm Equipment Marketplace</p>
			</header>
			<div className="app-body">
				<aside className="panel panel--left">
					<div className="filters">
						<div className="bid-form__field">
							<label htmlFor="search">Search</label>
							<input
								id="search"
								name="search"
								type="search"
								placeholder="Search title or description"
								value={searchTerm}
								onChange={(event) => setSearchTerm(event.target.value)}
							/>
						</div>
						<div className="bid-form__field">
							<label htmlFor="category-filter">Category</label>
							<select
								id="category-filter"
								name="category-filter"
								value={categoryFilter}
								onChange={(event) =>
									setCategoryFilter(
										event.target.value as ListingCategory | "all",
									)
								}
							>
								<option value="all">All Categories</option>
								{listingCategories.map((category) => (
									<option key={category} value={category}>
										{category}
									</option>
								))}
							</select>
						</div>
					</div>
					<div className="panel__heading-row">
						<h2 className="panel__heading">Listings</h2>
						<button
							type="button"
							className="panel__heading-action"
							onClick={() => {
								setShowCreateForm(true);
								setSelectedId(null);
							}}
						>
							+ New
						</button>
					</div>
					{loading && <div className="state-message">Loading listings...</div>}
					{error && (
						<div className="state-message state-message--error">{error}</div>
					)}
					{!loading && !error && listings.length === 0 && (
						<div className="empty-state empty-state--listings">
							<p>No listings match your filters.</p>
						</div>
					)}
					{!loading && !error && listings.length > 0 && (
						<div className="listing-grid">
							{listings.map((listing) => (
								<ListingCard
									key={listing.id}
									listing={listing}
									isSelected={listing.id === selectedId}
									onClick={() => setSelectedId(listing.id)}
								/>
							))}
						</div>
					)}
				</aside>
				<main className="panel panel--right">
					{selectedListing ? (
						<ListingDetail
							listing={selectedListing}
							onBidSuccess={handleBidSuccess}
						/>
					) : (
						<div className="empty-state">
							<p>Select a listing to view details and place a bid.</p>
						</div>
					)}
				</main>
			</div>

			{showCreateForm && (
				<div className="modal-layer">
					<button
						type="button"
						className="modal-backdrop"
						aria-label="Close create listing modal"
						onClick={closeCreateModal}
					/>
					<div
						className="modal-dialog"
						role="dialog"
						aria-modal="true"
						aria-labelledby="create-listing-title"
					>
						<div className="modal-dialog__header">
							<div>
								<p className="modal-dialog__eyebrow">New Listing</p>
								<h2 id="create-listing-title" className="modal-dialog__title">
									List your equipment
								</h2>
							</div>
							<button
								type="button"
								className="modal-dialog__close"
								onClick={closeCreateModal}
								aria-label="Close create listing modal"
							>
								×
							</button>
						</div>
						<CreateListingForm
							onSuccess={handleListingCreated}
							onCancel={closeCreateModal}
						/>
					</div>
				</div>
			)}
		</div>
	);
}
