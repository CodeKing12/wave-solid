// import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import { useFocusable } from "@/spatial-nav";
import { getDisplayDetails } from "./MediaCard";
import { SeriesObj } from "./MediaTypes";
import { Match, Show, Switch, createEffect } from "solid-js";

interface SeasonProps {
	season: SeriesObj;
	isVisible?: boolean;
	onFocus: ({ y }: { y: number }) => void;
	onClick: () => void;
}

export default function Season(props: SeasonProps) {
	const seasonDetails = getDisplayDetails(
		props.season._source.i18n_info_labels,
	);
	const mediaType = props.season._source.info_labels.mediatype;
	createEffect(() => console.log(props.isVisible));
	// let { rating, voteCount } = getRatingAggr(props.season._source.ratings);
	const { setRef, focused } = useFocusable({
		onEnterPress: props.onClick,
		get focusable() {
			return props.isVisible;
		},
		get focusKey() {
			return props.season._id;
		},
		onFocus: props.onFocus,
	});
	// createEffect(() =>
	// 	console.log("Season ", props.season._id, props.isVisible),
	// );
	// console.log(seasonDetails, season)

	return (
		<div
			class="relative h-[250px] w-[170px] cursor-pointer rounded-xl border-4 border-transparent border-opacity-75 duration-300 ease-in-out"
			classList={{ "border-yellow-300": focused() }}
			onClick={props.onClick}
			ref={setRef}
		>
			<Show when={seasonDetails.art.poster}>
				<img
					class="absolute bottom-0 left-0 right-0 top-0 h-full w-full rounded-xl"
					src={seasonDetails?.art.poster}
					alt={seasonDetails?.plot}
				/>
			</Show>
			{
				// mediaType === "episode" ?
				// <h4 class="rounded-tl-xl absolute top-0 left-0 bg-yellow-500 bg-opacity-80 text-black-1 font-semibold text-sm py-1 px-2">Episode { season._source.info_labels.episode }</h4>
				// : ""
			}
			<div class="absolute bottom-0 w-full rounded-b-[11px] bg-black bg-opacity-80 px-3 py-3 text-white">
				<h4>
					<Switch>
						<Match when={mediaType === "season"}>
							{props.season._source.info_labels.originaltitle ||
								`Season ${props.season._source.info_labels.season}`}
						</Match>
						<Match when={mediaType === "episode"}>
							{seasonDetails.title}
						</Match>
					</Switch>
				</h4>
			</div>
		</div>
	);
}
