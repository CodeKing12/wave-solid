// import { useState, useEffect, useCallback } from "react";
import { createSignal, createEffect } from "solid-js";
import { getDisplayDetails, getRatingAggr } from "./MediaCard";
import { convertSecondsToTime } from "@/utils/general";
// import { PlayCircle, VideoSlash } from "iconsax-react";
import MediaStreamOption from "./Stream";
// import { HashLoader } from "react-spinners";
import { SeriesObj, StreamObj } from "./MediaTypes";
// import { FocusDetails, setFocus, useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import StreamEpisodes from "./StreamEpisodes";
import { IconMovieOff, IconPlayerPlayFilled } from "@tabler/icons-solidjs";
import { Spinner, SpinnerType } from "solid-spinner";

export interface EpisodeProps {
    authToken: string;
    episode: SeriesObj;
    episodeStreams: StreamObj[];
    isLoadingStreams: boolean;
    // onFocus: ({ y }: { y: number }) => void;
    onClick: () => void;
    // onEpisodeStreamFocus?: (focusDetails: FocusDetails) => void;
    onEpisodeStreamClick: (stream: StreamObj, isEnterpress?: boolean) => void;
}

export default function Episode(props: EpisodeProps) {
    const episodeDetails = getDisplayDetails(props.episode._source.i18n_info_labels);
    const hasNoStreams = Array.isArray(props.episodeStreams) && !props.episodeStreams?.length;
    const [showStreams, setShowStreams] = createSignal(false);
    let { rating, voteCount } = getRatingAggr(props.episode._source.ratings);
    const focused = false

    // const onFocusStream = useCallback(
    //     () => {
    //         setFocus(episode._id)
    //     }, [episode._id]
    // )

    // function modifyStreamOffset(focusDetails: FocusDetails) {
    //     focusDetails.y += parseFloat(ref.current.offsetTop)
    //     onEpisodeStreamFocus?.(focusDetails)
    // }

    // const { ref, focused } = useFocusable({
    //     onEnterPress: onClick,
    //     onFocus: episodeStreams?.length ? onFocusStream : onFocus
    // });

    // useEffect(() => {
    //     // console.log(Boolean(episodeStreams?.length))
    //     episodeStreams?.length ? setFocus(episode._id) : ""
    // }, [episodeStreams, episode._id])

    // useEffect(() => {
    //     console.log(showStreams)
    // }, [showStreams])

    return (
        <div class={`max-w-full relative px-6 py-4 border-2 border-transparent hover:border-yellow-300 hover:border-opacity-100 rounded-xl transition-all duration-[400ms] ease-in-out ${props.episodeStreams?.length ? "border-yellow-300 border-opacity-60" : ""} ${focused ? "!border-yellow-300 !border-opacity-100" : ""}`}>
            <article class="flex items-center space-x-6 duration-[400ms] ease-in-out w-full">
                <img src={episodeDetails?.art?.poster} alt="" width="60" height="50" class="flex-none rounded-md bg-slate-100 w-16 h-20 object-cover" />
                <div class="min-w-0 relative flex-auto">
                    <h2 class="font-semibold text-white text-opacity-80 truncate mr-28">{ episodeDetails.title || `Season ${props.episode._source.info_labels.season}: Episode ${props.episode._source.info_labels.episode}` }</h2>
                    <dl class="mt-2.5 flex flex-wrap text-sm leading-6 font-medium text-gray-300 text-opacity-90">
                        <div class="absolute top-0 right-0 flex items-center space-x-1">
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
                            <dd class="px-1.5 ring-1 ring-slate-200 rounded">S{props.episode._source.info_labels.season || 1} E{props.episode._source.info_labels.episode?.toString().padStart(2, "0")}</dd>
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
                                <svg width="2" height="2" fill="currentColor" class="mx-2 text-slate-300" aria-hidden="true">
                                    <circle cx="1" cy="1" r="1" />
                                </svg>
                                { convertSecondsToTime(props.episode._source.info_labels.duration) }
                            </dd>
                        </div>
                        {
                            hasNoStreams ? (
                                <div class="ml-auto">
                                    <IconMovieOff class="text-yellow-300" />
                                </div>
                            ) : ""
                        }
                        {/* <div class="flex-none w-full mt-2 font-normal">
                            <dt class="sr-only">Cast</dt>
                            <dd class="text-gray-300">{ season._source.cast.map(actor => actor.name).join(", ") }</dd>
                        </div> */}
                    </dl>
                </div>
                <button class={`h-16 min-w-[48px] w-12 border-black-1 bg-yellow-300 text-black-1 rounded-md text-base tracking-wide font-bold border-2 border-transparent hover:bg-black-1 hover:border-yellow-300 hover:text-yellow-300 flex justify-center items-center !ml-10 ${hasNoStreams ? "opacity-40 pointer-events-none" : ""} ${focused && !hasNoStreams ? "!bg-black-1 !border-yellow-300 !text-yellow-300" : ""}`} onClick={props.onClick}>
                    <IconPlayerPlayFilled size={28} />
                </button>
            </article>

            <StreamEpisodes authToken={props.authToken} episodeStreams={props.episodeStreams} onEpisodeStreamClick={props.onEpisodeStreamClick} customFocusKey={props.episode._id} />

            <div class={`h-0 duration-300 ease-linear ${hasNoStreams ? "h-6 remove-element" : ""}`}>
                {
                    hasNoStreams ? 
                        <p class={`text-center text-gray-300 font-medium ${hasNoStreams ? "" : ""}`}>No streams available</p>
                        : ""
                }
            </div>
            {/* If you want a smoother height increase animation, you can comment out the loader below (and its wrapper div) */}
            <div class={`absolute top-0 left-0 right-0 w-full h-full backdrop-blur-sm rounded-2xl flex items-center justify-center opacity-0 invisible duration-300 ease-in-out ${props.isLoadingStreams ? "!opacity-100 !visible" : ""}`}>
                <Spinner type={SpinnerType.ballTriangle} width={50} height={50} color="#fde047" />
            </div>
        </div>
    )
}