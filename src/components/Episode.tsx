import { createEffect } from "solid-js";
import { getDisplayDetails, getRatingAggr } from "./MediaCard";
import { convertSecondsToTime } from "@/utils/general";
import { SeriesObj, StreamObj } from "./MediaTypes";
import StreamEpisodes from "./StreamEpisodes";
import { IconMovieOff, IconPlayerPlayFilled } from "@tabler/icons-solidjs";
import { Spinner, SpinnerType } from "solid-spinner";
import { FocusDetails, setFocus, useFocusable } from "@/spatial-nav";
import { Show } from "solid-js";

export interface EpisodeProps {
	authToken: string;
	episode: SeriesObj;
	episodeStreams: StreamObj[];
	isLoadingStreams: boolean;
	onFocus: ({ y }: { y: number }) => void;
	onClick: () => void;
	onEpisodeStreamFocus?: (focusDetails: FocusDetails) => void;
	onEpisodeStreamClick: (stream: StreamObj, isEnterpress?: boolean) => void;
}

export default function Episode(props: EpisodeProps) {
	const episodeDetails = getDisplayDetails(
		props.episode._source.i18n_info_labels,
	);
	const hasNoStreams = () =>
		Array.isArray(props.episodeStreams) && !props.episodeStreams?.length;
	// const [showStreams, setShowStreams] = createSignal(false);
	let { rating } = getRatingAggr(props.episode._source.ratings);

	const onFocusStream = () => {
		setFocus(props.episode._id);
	};

	const { ref, setRef, focused } = useFocusable({
		onEnterPress: props.onClick,
		onFocus: props.episodeStreams?.length ? onFocusStream : props.onFocus,
	});

	function modifyStreamOffset(focusDetails: FocusDetails) {
		focusDetails.y += parseFloat(ref()?.offsetTop.toString() ?? "");
		props.onEpisodeStreamFocus?.(focusDetails);
	}

	createEffect(() => {
		// console.log(Boolean(episodeStreams?.length))
		if (props.episodeStreams?.length) {
			setFocus(props.episode._id);
		}
	});

	return (
		<div
			class="relative max-w-full rounded-xl border-2 border-transparent px-6 py-4 transition-all duration-[400ms] ease-in-out hover:border-yellow-300 hover:border-opacity-100"
			classList={{
				"!border-yellow-300 !border-opacity-100": focused(),
				"border-yellow-300 border-opacity-60":
					props.episodeStreams?.length > 0,
			}}
			ref={setRef}
		>
			<article class="flex w-full items-center space-x-6 duration-[400ms] ease-in-out">
				<img
					src={episodeDetails?.art?.poster}
					alt=""
					width="60"
					height="50"
					class="h-20 w-16 flex-none rounded-md bg-slate-100 object-cover"
				/>
				<div class="relative min-w-0 flex-auto">
					<h2 class="mr-28 truncate font-semibold text-white text-opacity-80">
						{episodeDetails.title ||
							`Season ${props.episode._source.info_labels.season}: Episode ${props.episode._source.info_labels.episode}`}
					</h2>
					<dl class="mt-2.5 flex flex-wrap text-sm font-medium leading-6 text-gray-300 text-opacity-90">
						<div class="absolute right-0 top-0 flex items-center space-x-1">
							<dt class="fill-yellow-300">
								<span class="sr-only">Star rating</span>
								<svg class="" width="16" height="20">
									<path d="M7.05 3.691c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.372 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.539 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.783.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.363-1.118L.98 9.483c-.784-.57-.381-1.81.587-1.81H5.03a1 1 0 00.95-.69L7.05 3.69z" />
								</svg>
							</dt>
							<dd>{rating.toFixed(1)}</dd>
						</div>
						<div>
							<dt class="sr-only">Episode Number</dt>
							<dd class="rounded px-1.5 ring-1 ring-slate-200">
								S{props.episode._source.info_labels.season || 1}{" "}
								E
								{props.episode._source.info_labels.episode
									?.toString()
									.padStart(2, "0")}
							</dd>
						</div>
						<div class="ml-2">
							<dt class="sr-only">Aired</dt>
							<dd>{props.episode._source.info_labels.aired}</dd>
						</div>
						{/* <div>
                            <dt class="sr-only">Episode</dt>
                            <dd class="flex items-center">
                                <svg width="2" height="2" fill="currentColor" class="mx-2 text-slate-300" aria-hidden="true">
                                    <circle cx="1" cy="1" r="1" />
                                </svg>
                                Episode { season._source.info_labels.episode }
                            </dd>
                        </div> */}
						<div>
							<dt class="sr-only">Runtime</dt>
							<dd class="flex items-center">
								<svg
									width="2"
									height="2"
									fill="currentColor"
									class="mx-2 text-slate-300"
									aria-hidden="true"
								>
									<circle cx="1" cy="1" r="1" />
								</svg>
								{convertSecondsToTime(
									props.episode._source.info_labels.duration,
								)}
							</dd>
						</div>
						{hasNoStreams() ? (
							<div class="ml-auto">
								<IconMovieOff class="text-yellow-300" />
							</div>
						) : (
							""
						)}
						{/* <div class="flex-none w-full mt-2 font-normal">
                            <dt class="sr-only">Cast</dt>
                            <dd class="text-gray-300">{ season._source.cast.map(actor => actor.name).join(", ") }</dd>
                        </div> */}
					</dl>
				</div>
				<button
					class={`!ml-10 flex h-16 w-12 min-w-[48px] items-center justify-center rounded-md border-2 border-black-1 border-transparent bg-yellow-300 text-base font-bold tracking-wide text-black-1 hover:border-yellow-300 hover:bg-black-1 hover:text-yellow-300 ${
						hasNoStreams() ? "pointer-events-none opacity-40" : ""
					} ${
						focused() && !hasNoStreams()
							? "!border-yellow-300 !bg-black-1 !text-yellow-300"
							: ""
					}`}
					onClick={props.onClick}
				>
					<IconPlayerPlayFilled size={28} />
				</button>
			</article>

			<StreamEpisodes
				authToken={props.authToken}
				episodeStreams={props.episodeStreams}
				onEpisodeStreamClick={props.onEpisodeStreamClick}
				onEpisodeStreamFocus={modifyStreamOffset}
				customFocusKey={props.episode._id}
			/>

			<div
				class="h-0 duration-300 ease-linear"
				classList={{ "remove-element h-6": hasNoStreams() }}
			>
				<Show when={hasNoStreams()}>
					<p class="text-center font-medium text-gray-300">
						No streams available
					</p>
				</Show>
			</div>
			{/* If you want a smoother height increase animation, you can comment out the loader below (and its wrapper div) */}
			<div
				class={`invisible absolute left-0 right-0 top-0 flex h-full w-full items-center justify-center rounded-2xl opacity-0 backdrop-blur-sm duration-300 ease-in-out ${
					props.isLoadingStreams ? "!visible !opacity-100" : ""
				}`}
			>
				<Spinner
					type={SpinnerType.ballTriangle}
					width={50}
					height={50}
					color="#fde047"
				/>
			</div>
		</div>
	);
}
