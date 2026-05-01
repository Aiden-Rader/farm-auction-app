import { useState } from "react";
import { createListing } from "../api/listings";
import {
	type Listing,
	type ListingCategory,
	listingCategories,
} from "../types";

interface Props {
	onSuccess: (listing: Listing) => void;
	onCancel: () => void;
}

function parseCategory(value: FormDataEntryValue | null): ListingCategory {
	if (value === "tractor" || value === "combine" || value === "attachment") {
		return value;
	}
	return "implement";
}

export default function CreateListingForm({ onSuccess, onCancel }: Props) {
	const [error, setError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);

	const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError(null);

		const form = e.currentTarget;
		const data = new FormData(form);
		const title = (data.get("title") as string).trim();
		const description = (data.get("description") as string).trim();
		const category = parseCategory(data.get("category"));
		const startingPrice = Number(data.get("startingPrice"));
		const imageUrl = (data.get("imageUrl") as string).trim();

		if (!title) {
			setError("Title is required.");
			return;
		}

		if (!description) {
			setError("Description is required.");
			return;
		}

		if (!Number.isFinite(startingPrice) || startingPrice < 0) {
			setError("Starting price must be zero or greater.");
			return;
		}

		setSubmitting(true);
		try {
			const listing = await createListing({
				title,
				description,
				category,
				startingPrice,
				imageUrl,
			});
			onSuccess(listing);
			form.reset();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to create listing");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<form className="bid-form" onSubmit={handleSubmit}>
			<h4 className="bid-form__title">New Listing</h4>
			{error && <div className="bid-form__error">{error}</div>}
			<div className="bid-form__field">
				<label htmlFor="title">Title</label>
				<input
					id="title"
					name="title"
					type="text"
					placeholder="e.g. 2018 John Deere 6120M"
					disabled={submitting}
				/>
			</div>
			<div className="bid-form__field">
				<label htmlFor="description">Description</label>
				<textarea
					id="description"
					name="description"
					rows={4}
					placeholder="Describe the equipment, condition, and key details"
					disabled={submitting}
				/>
			</div>
			<div className="bid-form__field">
				<label htmlFor="category">Category</label>
				<select
					id="category"
					name="category"
					defaultValue="implement"
					disabled={submitting}
				>
					{listingCategories.map((category) => (
						<option key={category} value={category}>
							{category}
						</option>
					))}
				</select>
			</div>
			<div className="bid-form__field">
				<label htmlFor="startingPrice">Starting Price</label>
				<input
					id="startingPrice"
					name="startingPrice"
					type="number"
					min={0}
					step={1}
					placeholder="e.g. 25000"
					disabled={submitting}
				/>
			</div>
			<div className="bid-form__field">
				<label htmlFor="imageUrl">Image URL</label>
				<input
					id="imageUrl"
					name="imageUrl"
					type="url"
					placeholder="https://example.com/photo.jpg"
					disabled={submitting}
				/>
			</div>
			<button type="submit" className="bid-form__submit" disabled={submitting}>
				{submitting ? "Creating..." : "Create Listing"}
			</button>
			<button
				type="button"
				className="bid-form__cancel"
				onClick={onCancel}
				disabled={submitting}
			>
				Cancel
			</button>
		</form>
	);
}
