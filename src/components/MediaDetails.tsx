import { convertSecondsToTime, formatDate } from "@/utils/general";
import { MediaSource, I18nInfoLabel } from "./MediaTypes";
import { IconStarFilled } from "@tabler/icons-solidjs";
// import FocusLeaf from "./FocusLeaf";
// import { Star1 } from "iconsax-react";
// import { FocusContext, useFocusable } from "@noriginmedia/norigin-spatial-navigation";

export interface MediaDetailsProps {
    movieTitle: string,
    displayDetails: I18nInfoLabel,
    movieDetails: MediaSource,
    rating: number,
    voteCount: number,
    // onFocus: ({ y }: {y: number}) => void;
}

export default function MediaDetails(props: MediaDetailsProps) {
    // const {
    //     ref,
    //     focusSelf,
    //     hasFocusedChild,
    //     focusKey,
    // } = useFocusable({
    //     autoRestoreFocus: true,
    //     // onFocus
    // });


    return (
        // <FocusContext.Provider value={focusKey}>
            <div class="media-details xl:max-w-[780px] mr-8">
            {/* xl:max-w-[620px] */}
                <div class="content">
                    <h2 class="font-semibold text-white opacity-90 text-4xl mb-6">{ props.movieTitle }</h2>
                </div>

                {
                    props.displayDetails?.plot ? (
                        <div class="content">
                            <p class="xl:max-w-[750px] leading-loose mb-8">
                            {/* xl:max-w-[600px] */}
                                {
                                    props.displayDetails?.plot
                                }
                            </p>
                        </div>
                    ) : ""
                }

                <div class="content">
                    <div class="grid md:grid-cols-2 gap-7 text-[17px] mb-8">
                        <p class="flex flex-col gap-2">
                            <span class="text-[15px] opacity-40">Release Date: </span>
                            <span class="">{ formatDate(props?.movieDetails.info_labels?.premiered) || "" }</span>
                        </p>
                        <p class="flex flex-col gap-2">
                            <span class="text-[15px] opacity-40">Genre(s): </span>
                            <span class="">{ props?.movieDetails.info_labels.genre.join(", ") }</span>
                        </p>
                        {
                            props.movieDetails.info_labels.director.length ? (
                                <p class="flex flex-col gap-2">
                                    <span class="text-[15px] opacity-40">{ props.movieDetails.info_labels.director.length > 1 ? "Directors:" : "Director:" } </span>
                                    <span class="">{ props.movieDetails.info_labels.director.join(", ") }</span>
                                </p>
                            ) : ""
                        }
                        {
                            props.movieDetails.info_labels.studio.length ? (
                                <p class="flex flex-col gap-2">
                                    <span class="text-[15px] opacity-40">{ props.movieDetails.info_labels.studio.length > 1 ? "Studios:" : "Studio:" } </span>
                                    <span class="">{ props.movieDetails.info_labels.studio.join(", ") }</span>
                                </p>
                            ) : ""
                        }
                    </div>
                </div>

                <div class="content">
                    <div class="grid md:grid-cols-2 gap-7 text-[17px] mb-8">
                        <p class="flex flex-col gap-2">
                            <span class="text-[15px] opacity-40">Run Time: </span>
                            <span class="">{ convertSecondsToTime(props.movieDetails.info_labels.duration) }</span>
                        </p>
                        <div class="flex flex-col gap-2">
                            <span class="text-[15px] opacity-40">Rating: </span>
                            <div class="flex items-center gap-2">
                                <span class="">{ (props.rating * 2) % 1 === 0 ? (props.rating * 2).toString() : (props.rating * 2).toFixed(1) }/10</span>
                                <div class="flex items-center gap-0.5">
                                    {
                                        Array(Math.round(props.rating)).fill("").map((value, index) => {
                                            return (
                                                <IconStarFilled class="fill-yellow-300 text-yellow-300" key={index} size={16} />
                                            )
                                        })
                                    }
                                    {
                                        Array(5 - Math.round(props.rating)).fill("").map((value, index) => {
                                            return (
                                                <IconStarFilled class="fill-gray-300 text-gray-300 opacity-90" key={index} size={16} />
                                            )
                                        })
                                    }
                                </div>
                                <p class="text-[15px] text-gray-300 text-opacity-70 font-medium leading-normal ml-3">({ props.voteCount })</p>
                            </div>
                        </div>
                    </div>
                </div>
                {
                    props.movieDetails.cast.length ? (
                        <div class="content">
                            <p class="flex flex-col gap-2">
                                <span class="text-[15px] opacity-40">Cast: </span>
                                <span class="leading-loose opacity-90">{ props.movieDetails.cast.map(actor => actor.name).join(", ") }</span>
                            </p>
                        </div>
                    ) : ""
                }
            </div>
        // </FocusContext.Provider>
    )
}