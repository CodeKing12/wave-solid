import { Heart, Star1, Image as ImageIcon } from "iconsax-react";
import { I18nInfoLabel, RatingObj } from "./MediaTypes";
import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";

export function getDisplayDetails(mediaI18n: I18nInfoLabel[]) {
	let selectedDetails;

	selectedDetails = mediaI18n?.find(
		(obj: I18nInfoLabel) => obj.lang === "en",
	);
	if (
		!selectedDetails ||
		!selectedDetails.hasOwnProperty("art") ||
		!selectedDetails.art.hasOwnProperty("poster") ||
		!selectedDetails.title
	) {
		let selectedObject = null;

		for (const info of mediaI18n) {
			if (info.art && info.art.poster && info.title) {
				selectedObject = info;
				break; // Exit the loop once a poster is found
			}
		}

		// If no object with a poster is found, select the first object
		if (!selectedObject) {
			selectedObject = mediaI18n[0];
		}

		selectedDetails = selectedObject;
	}

	if (
		selectedDetails?.art?.poster &&
		selectedDetails?.art?.poster.startsWith("//")
	) {
		selectedDetails.art.poster = "https:" + selectedDetails?.art?.poster;
	}

	return selectedDetails;
}

export function getRatingAggr(ratings: RatingObj) {
	let aggrRating: number = 0;
	let voteCount: number = 0;

	if (Object.keys(ratings).length) {
		for (const source in ratings) {
			const ratingData = ratings[source];
			aggrRating += ratingData.rating;
			voteCount += ratingData.votes;
		}

		aggrRating = aggrRating / Object.keys(ratings).length / 2;
	}

	return { rating: aggrRating, voteCount };
}

export default function MediaCard({
	media,
	showMediaInfo,
	onEnterPress,
	onFocus,
}: any) {
	let genres: string;
	let { rating, voteCount } = getRatingAggr(media?.ratings);
	const premiere_date = new Date(media.info_labels?.premiered);
	const displayDetails = getDisplayDetails(media.i18n_info_labels);
	const { setRef, focused } = useFocusable({
		onEnterPress,
		onFocus,
	});

	// if (!displayDetails) {
	//     if (media && media.i18n_info_labels) {
	//         displayDetails = media.i18n_info_labels[media.i18n_info_labels?.length - 1]
	//     }
	// }

	if (media?.info_labels?.genre.length > 1) {
		genres = media?.info_labels.genre[0] + "/" + media.info_labels.genre[1];
	} else {
		genres = media?.info_labels?.genre[0];
	}

	return (
		<div
			class={`group relative h-[330px] w-[240px] cursor-pointer overflow-clip rounded-xl border-4 border-transparent bg-black-1 bg-opacity-60 backdrop-blur-2xl duration-[400ms] ease-in-out ${
				focused ? "border-yellow-300 !duration-300" : ""
			}`}
			ref={setRef}
		>
			{
				/* eslint-disable @next/next/no-img-element */
				displayDetails?.art?.poster ? (
					<img
						width={240}
						height={330}
						class="h-[330px] w-full rounded-xl object-cover opacity-75"
						src={displayDetails?.art.poster}
						alt={displayDetails?.plot}
					/>
				) : (
					<ImageIcon
						size={85}
						class="group-hover:-fill-yellow-300 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 fill-transparent text-yellow-300 transition-all duration-500 ease-linear"
						variant="Broken"
					/>
				)
				/* eslint-enable @next/next/no-img-element */
			}
			<div
				class={`invisible absolute bottom-0 h-full w-full rounded-[11px] bg-black bg-opacity-80 px-3 py-5 text-gray-100 opacity-0 duration-[400ms] ease-in-out group-hover:visible group-hover:opacity-100 ${
					focused ? "!visible !opacity-100 !duration-300" : ""
				}`}
				onClick={() => showMediaInfo(true)}
			>
				<div class="flex h-full flex-col justify-between">
					<div>
						<h5 class="mb-1 text-[17px] font-medium duration-300 ease-linear group-hover:text-yellow-300">
							{displayDetails?.title ||
								media.info_labels?.originaltitle}
						</h5>
						<div class="flex items-center justify-between">
							<p class="text-sm text-gray-400">{genres}</p>
							<p class="text-sm text-gray-400 text-opacity-80">
								{premiere_date.getFullYear() || ""}
							</p>
						</div>
						<div class="mt-2 flex items-center justify-between">
							<div class="flex gap-0.5">
								{Array(Math.round(rating))
									.fill("")
									.map((value, index) => {
										return (
											<Star1
												class="fill-yellow-300 text-yellow-300"
												key={index}
												size={18}
											/>
										);
									})}
								{Array(5 - Math.round(rating))
									.fill("")
									.map((value, index) => {
										return (
											<Star1
												class="fill-gray-300 text-gray-300 opacity-90"
												key={index}
												size={18}
											/>
										);
									})}
							</div>
							<p class="text-sm font-medium leading-normal text-gray-300 text-opacity-70">
								({voteCount})
							</p>
						</div>
					</div>
					<div class="flex items-center justify-between">
						<button class="group flex items-center gap-4 rounded-2xl border-none bg-[rgba(249,249,249,0.20)] p-3 text-lg font-bold tracking-wide text-[#F9F9F9] !outline-none backdrop-blur-[5px] hover:bg-[#F9F9F9] hover:text-black-1">
							<Heart
								width={20}
								class="group-hover:-fill-black-1"
							/>
						</button>

						<button class="rounded-xl border-2 border-transparent bg-yellow-300 px-10 py-3 text-sm font-semibold tracking-wide text-black-1 hover:border-yellow-300 hover:bg-black-1 hover:text-yellow-300">
							Watch
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
