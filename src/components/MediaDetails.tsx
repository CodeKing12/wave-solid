import { convertSecondsToTime, formatDate } from "@/utils/general";
import { MediaSource, I18nInfoLabel } from "./MediaTypes";
import { IconStarFilled } from "@tabler/icons-solidjs";
import { FocusContext, useFocusable } from "@/spatial-nav";
import FocusLeaf from "./Utilities/FocusLeaf";
import { For, Show, createSignal } from "solid-js";

export interface MediaDetailsProps {
	movieTitle: string;
	displayDetails?: I18nInfoLabel;
	movieDetails?: MediaSource;
	rating: number;
	voteCount: number;
	onFocus: ({ y }: { y: number }) => void;
}

export default function MediaDetails(props: MediaDetailsProps) {
	const [fullCast, setFullCast] = createSignal(false);
	const { setRef, focusKey } = useFocusable({
		autoRestoreFocus: true,
		focusKey: "MEDIA-DETAILS",
		// onFocus: props.onFocus
	});

	return (
		<FocusContext.Provider value={focusKey()}>
			<div class="media-details mr-8 xl:max-w-[780px]" ref={setRef}>
				{/* xl:max-w-[620px] */}
				<FocusLeaf
					class="content"
					focusedStyles="on-focus"
					customFocusKey="MEDIA-TITLE"
					onFocus={props.onFocus}
				>
					<h2 class="mb-6 text-4xl font-semibold text-white opacity-90">
						{props.movieTitle}
					</h2>
				</FocusLeaf>

				<Show when={props.displayDetails?.plot}>
					<FocusLeaf
						class="content"
						focusedStyles="on-focus"
						onFocus={props.onFocus}
					>
						<p class="mb-8 text-lg leading-loose xl:max-w-[750px]">
							{/* xl:max-w-[600px] */}
							{props.displayDetails?.plot}
						</p>
					</FocusLeaf>
				</Show>

				<FocusLeaf
					class="content"
					focusedStyles="on-focus"
					onFocus={props.onFocus}
				>
					<div class="mb-8 grid gap-7 text-lg md:grid-cols-2">
						<p class="flex flex-col space-y-2">
							<span class="text-[15px] opacity-40">
								Release Date:{" "}
							</span>
							<span class="">
								{formatDate(
									props.movieDetails?.info_labels?.premiered,
								)}
							</span>
						</p>
						<p class="flex flex-col space-y-2">
							<span class="text-[15px] opacity-40">
								Genre(s):{" "}
							</span>
							<span class="">
								{props.movieDetails?.info_labels.genre.join(
									", ",
								)}
							</span>
						</p>

						<Show
							when={
								props.movieDetails?.info_labels.director.length
							}
						>
							<p class="flex flex-col space-y-2">
								<span class="text-[15px] opacity-40">
									{props.movieDetails?.info_labels.director
										.length || 0 > 1
										? "Directors:"
										: "Director:"}{" "}
								</span>
								<span class="">
									{props.movieDetails
										? props.movieDetails.info_labels.director.join(
												", ",
										  )
										: ""}
								</span>
							</p>
						</Show>

						<Show
							when={props.movieDetails?.info_labels.studio.length}
						>
							<p class="flex flex-col space-y-2">
								<span class="text-[15px] opacity-40">
									{props.movieDetails?.info_labels.studio
										.length || 0 > 1
										? "Studios:"
										: "Studio:"}{" "}
								</span>
								<span class="">
									{props.movieDetails
										? props.movieDetails.info_labels.studio.join(
												", ",
										  )
										: ""}
								</span>
							</p>
						</Show>
					</div>
				</FocusLeaf>

				<FocusLeaf
					class="content"
					focusedStyles="on-focus"
					onFocus={props.onFocus}
				>
					<div class="mb-8 grid gap-7 text-lg md:grid-cols-2">
						<p class="flex flex-col space-y-2">
							<span class="text-[15px] opacity-40">
								Run Time:{" "}
							</span>
							<span class="">
								{convertSecondsToTime(
									props.movieDetails?.info_labels.duration,
								)}
							</span>
						</p>
						<div class="flex flex-col space-y-2">
							<span class="text-[15px] opacity-40">Rating: </span>
							<div class="flex items-center space-x-2">
								<span class="">
									{(props.rating * 2) % 1 === 0
										? (props.rating * 2).toString()
										: (props.rating * 2).toFixed(1)}
									/10
								</span>
								<div class="flex items-center space-x-0.5">
									<For
										each={Array(
											Math.round(props.rating),
										).fill("")}
									>
										{(value, index) => (
											<IconStarFilled
												class="fill-yellow-300 text-yellow-300"
												key={index()}
												size={16}
											/>
										)}
									</For>
									<For
										each={Array(
											5 - Math.round(props.rating),
										).fill("")}
									>
										{(value, index) => (
											<IconStarFilled
												class="fill-gray-300 text-gray-300 opacity-90"
												key={index()}
												size={16}
											/>
										)}
									</For>
								</div>
								<p class="ml-3 text-[15px] font-medium leading-normal text-gray-300 text-opacity-70">
									({props.voteCount})
								</p>
							</div>
						</div>
					</div>
				</FocusLeaf>
				{props.movieDetails?.cast.length ? (
					<FocusLeaf
						class="content"
						focusedStyles="on-focus"
						onFocus={props.onFocus}
						onEnterPress={() => setFullCast(!fullCast())}
					>
						<p class="flex flex-col space-y-2">
							<span class="text-[15px] opacity-40">Cast: </span>
							<span
								class="leading-[32px] opacity-90"
								classList={{
									// Make the maximum height a multiple of the line-height
									"!max-h-[96px] overflow-hidden block ":
										!fullCast(),
								}}
							>
								{props.movieDetails?.cast
									.map((actor) => actor.name)
									.join(", ")}
							</span>
							<span class="cursor-pointer text-yellow-300">
								<a onclick={() => setFullCast(!fullCast())}>
									{fullCast()
										? "Shorten Cast"
										: "View Full Cast"}
								</a>
							</span>
						</p>
					</FocusLeaf>
				) : (
					""
				)}
			</div>
		</FocusContext.Provider>
	);
}
