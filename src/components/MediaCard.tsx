// import { Heart, Star1, Image as ImageIcon } from "iconsax-react";
import { useFocusable } from "@/spatial-nav/useFocusable";
import { I18nInfoLabel, MediaObj, MediaSource, RatingObj } from "./MediaTypes";
// import { FocusableComponentLayout, useFocusable } from "@noriginmedia/norigin-spatial-navigation";
// import Image from "next/image";
import { resolveArtItem, smallPoster } from "@/utils/general";
import {
	IconHeart,
	IconPhoto,
	IconStar,
	IconStarFilled,
} from "@tabler/icons-solidjs";
import { createEffect, createMemo } from "solid-js";
// import { memo, useCallback, useMemo, useState } from "react";

export interface MediaCardProps {
	id: string;
	// currentPagination: number,
	// currentPage: PageType,
	index: number;
	media: MediaObj;
	showMediaInfo: (mediaInfo: MediaObj) => void;
	onEnterPress: (mediaInfo: MediaObj) => void;
	// onFocus: (focusDetails: FocusableComponentLayout) => void;
}

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

export function getRatingAggr(ratings: RatingObj | undefined = {}) {
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

const MediaCard = function MediaCard(props: MediaCardProps) {
	// console.log("MediaCard is re-rendering")
	console.log("New MediaCard");
	// const [media] = useContext(MediaContext)
	// createEffect(() =>
	//     console.log(media, props.index)
	// )

	// const
	// const media = createMemo(() => {
	//     return props.pageMedia[props.currentPage[props.currentPagination]]
	//     // Get media from store
	// })
	const mediaSource = createMemo(() => props.media?._source);
	const reviews = () => {
		if (mediaSource()?.ratings) {
			return getRatingAggr(mediaSource()?.ratings);
		} else {
			return { rating: 0, voteCount: 0 };
		}
	};
	const premiere_date = new Date(mediaSource()?.info_labels?.premiered);
	const poster = createMemo(() => {
		if (mediaSource()?.i18n_info_labels) {
			return resolveArtItem(mediaSource()?.i18n_info_labels, "poster");
		} else {
			return "";
		}
	});
	const displayDetails = () => {
		if (mediaSource()?.i18n_info_labels) {
			getDisplayDetails(mediaSource().i18n_info_labels);
		} else {
			return {} as I18nInfoLabel;
		}
	};
	const posterLink = createMemo(() => (poster ? smallPoster(poster()) : ""));
	const { setRef, focused } = useFocusable({
		// onEnterPress: () => onEnterPress(media),
		// onFocus
	});

	function onImgError(event: any) {
		console.log("Image Error");
		// setPosterLink(smallPoster(poster(), true) || "")
	}

	const renderStars = createMemo(() => {
		const filledIcons = Array(Math.round(reviews().rating))
			.fill("")
			.map((value, index) => {
				return (
					<IconStarFilled
						class="fill-yellow-300 text-yellow-300"
						key={index}
						size={18}
					/>
				);
			});

		const emptyIcons = Array(5 - Math.round(reviews().rating))
			.fill("")
			.map((value, index) => {
				return (
					<IconStar
						class="fill-gray-300 text-gray-300 opacity-90"
						key={index + 5}
						size={18}
					/>
				);
			});

		return filledIcons.concat(emptyIcons);
	});

	const starRatings = () => {
		return renderStars();
	};

	const genres = () => {
		if (mediaSource()?.info_labels?.genre.length > 1) {
			return (
				mediaSource()?.info_labels.genre[0] +
				"/" +
				mediaSource()?.info_labels.genre[1]
			);
		} else {
			return mediaSource()?.info_labels?.genre[0];
		}
	};

	// createEffect(() => console.log(ref()));
	createEffect(() => (focused ? console.log(focused) : ""));

	// if (!displayDetails) {
	//     if (media && media.i18n_info_labels) {
	//         displayDetails = media.i18n_info_labels[media.i18n_info_labels?.length - 1]
	//     }
	// }

	return (
		//   <div class={`w-[240px] h-[330px] rounded-xl bg-black-1 backdrop-blur-2xl bg-opacity-60 cursor-pointer group relative overflow-clip duration-[400ms] ease-in-out border-4 border-transparent ${focused ? "!duration-300 border-yellow-300" : ""}`} ref={ref}>
		mediaSource ? (
			<div
				id={props.id}
				class={`media-card focusable group relative mx-auto h-[340px] w-full max-w-[250px] cursor-pointer overflow-clip rounded-xl border-4 border-transparent bg-black-1 bg-opacity-60 backdrop-blur-2xl duration-[400ms] ease-in-out xsm:max-w-[230px] sm:h-[300px] ${
					focused ? "border-yellow-300 !duration-300" : ""
				}`}
				ref={setRef}
			>
				{
					/* eslint-disable @next/next/no-img-element */
					poster() ? (
						// <Image width={300} height={400} class="w-full h-full max-h-full object-cover rounded-xl opacity-75" src={smallPoster(poster) || ""} alt={displayDetails?.plot} />
						<img
							id={`${props.id}-poster`}
							width={300}
							height={400}
							class="h-full max-h-full w-full rounded-xl object-cover opacity-75"
							src={posterLink() || ""}
							alt={displayDetails()?.title}
							onError={onImgError}
						/>
					) : (
						<IconPhoto
							size={85}
							class="group-hover:-fill-yellow-300 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 fill-transparent text-yellow-300 transition-all duration-500 ease-linear"
						/>
					)
					/* eslint-enable @next/next/no-img-element */
				}
				<div
					class={`invisible absolute bottom-0 h-full w-full rounded-[11px] bg-black bg-opacity-80 px-3 py-5 text-gray-100 opacity-0 duration-[400ms] ease-in-out group-hover:visible group-hover:opacity-100`}
					onClick={() => props.showMediaInfo(props.media)}
				>
					<div class="flex h-full flex-col justify-between">
						<div>
							<h5 class="mb-1 text-[15px] font-medium duration-300 ease-linear group-hover:text-yellow-300 sm:text-base lg:text-[17px]">
								{displayDetails()?.title ||
									mediaSource()?.info_labels?.originaltitle}
							</h5>
							<div class="flex flex-col justify-between sm:flex-row sm:items-center">
								<p class="text-sm text-gray-400">{genres()}</p>
								<p class="text-sm text-gray-400 text-opacity-80">
									{premiere_date.getFullYear() || ""}
								</p>
							</div>
							<div class="mt-2 flex items-center justify-between">
								<div class="flex scale-90 gap-0.5 sm:scale-100">
									{starRatings()}
								</div>
								<p class="text-sm font-medium leading-normal text-gray-300 text-opacity-70">
									({reviews().voteCount})
								</p>
							</div>
						</div>
						<div class="flex items-center justify-between">
							<button class="group flex items-center gap-4 rounded-2xl border-none bg-[rgba(249,249,249,0.20)] p-3 text-lg font-bold tracking-wide text-[#F9F9F9] !outline-none backdrop-blur-[5px] hover:bg-[#F9F9F9] hover:text-black-1">
								<IconHeart
									width={20}
									class="group-hover:-fill-black-1"
								/>
							</button>

							{/* <button class="px-10 py-3 bg-yellow-300 text-black-1 rounded-xl text-sm tracking-wide font-semibold border-2 border-transparent hover:bg-black-1 hover:border-yellow-300 hover:text-yellow-300">
                                Watch
                            </button> */}
						</div>
					</div>
				</div>
			</div>
		) : (
			<div class="media-card group relative mx-auto flex h-[340px] w-full max-w-[250px] animate-pulse cursor-pointer items-center justify-center overflow-clip rounded-xl border-4 border-transparent bg-black-1 bg-opacity-60 backdrop-blur-2xl duration-[400ms] ease-in-out xsm:max-w-[230px] sm:h-[300px]">
				<IconPhoto size={40} color="text-gray-600" />
			</div>
		)
	);
};

export default MediaCard;
