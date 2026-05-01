import { useEffect, useState } from "react";
import { getListings } from "./api/listings";
import CreateListingForm from "./components/CreateListingForm";
import ListingCard from "./components/ListingCard";
import ListingDetail from "./components/ListingDetail";
import type { Listing } from "./types";

export default function App() {
	const [listings, setListings] = useState<Listing[]>([]);
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		getListings()
			.then((data) => setListings(data))
			.catch((err) =>
				setError(
					err instanceof Error ? err.message : "Failed to load listings",
				),
			)
			.finally(() => setLoading(false));
	}, []);

	const selectedListing = listings.find((l) => l.id === selectedId) ?? null;

	const handleBidSuccess = (updated: Listing) => {
		setListings((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
	};

	const handleListingCreated = (listing: Listing) => {
		setListings((prev) => [...prev, listing]);
		setSelectedId(listing.id);
		setShowCreateForm(false);
	};

	const closeCreateModal = () => {
		setShowCreateForm(false);
	};

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
					{loading && <div className="state-message">Loading listings…</div>}
					{error && (
						<div className="state-message state-message--error">{error}</div>
					)}
					{!loading && !error && (
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

			{/* Create listing modal */}
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
