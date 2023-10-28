// import { Heart, Star1, Image as ImageIcon } from "iconsax-react";
import { I18nInfoLabel, MediaObj, MediaSource, RatingObj } from "./MediaTypes";
// import { FocusableComponentLayout, useFocusable } from "@noriginmedia/norigin-spatial-navigation";
// import Image from "next/image";
import { resolveArtItem, smallPoster } from "@/utils/general";
import { IconHeart, IconPhoto, IconStar, IconStarFilled } from "@tabler/icons-solidjs";
import { createSignal, createMemo } from "solid-js";
// import { memo, useCallback, useMemo, useState } from "react";

export interface MediaCardProps {
    id: string,
    media: MediaObj,
    showMediaInfo: (mediaInfo: MediaObj) => void,
    onEnterPress: (mediaInfo: MediaObj) => void;
    // onFocus: (focusDetails: FocusableComponentLayout) => void;
}

export function getDisplayDetails(mediaI18n: I18nInfoLabel[]) {
    let selectedDetails;

    selectedDetails = mediaI18n?.find((obj: I18nInfoLabel) => obj.lang === "en")
    if (!selectedDetails || !selectedDetails.hasOwnProperty("art") || !selectedDetails.art.hasOwnProperty("poster") || !selectedDetails.title) {
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

    if (selectedDetails?.art?.poster && selectedDetails?.art?.poster.startsWith("//")) {
        selectedDetails.art.poster = "https:" + selectedDetails?.art?.poster
    }

    return selectedDetails;
}

export function getRatingAggr(ratings: RatingObj) {
    let aggrRating: number = 0
    let voteCount: number = 0;

    if (Object.keys(ratings).length) {
        for (const source in ratings) {
            const ratingData = ratings[source];
            aggrRating += ratingData.rating;
            voteCount += ratingData.votes;
        }
        
        aggrRating = (aggrRating / Object.keys(ratings).length) / 2
    }
    
    return { rating: aggrRating, voteCount };
}

const MediaCard = function MediaCard(props: MediaCardProps) {
    // console.log("MediaCard is re-rendering")
    let genres: string;
    const mediaSource = props.media?._source
    let { rating, voteCount } = mediaSource?.ratings ? getRatingAggr(mediaSource?.ratings) : { rating: 0, voteCount: 0 };
    const premiere_date = new Date(mediaSource?.info_labels?.premiered);
    const poster = mediaSource?.i18n_info_labels ? resolveArtItem(mediaSource?.i18n_info_labels, "poster") : "";
    let displayDetails = mediaSource?.i18n_info_labels ? getDisplayDetails(mediaSource.i18n_info_labels) : {} as I18nInfoLabel;
    const [posterLink, setPosterLink] = createSignal(poster ? smallPoster(poster) : "")
    // const { ref, focused } = useFocusable({
    //     onEnterPress: () => onEnterPress(media),
    //     onFocus
    // });

    function onImgError(event: any) {
        setPosterLink(smallPoster(poster, true) || "")
    }

    const renderStars = createMemo(() => {
        const filledIcons = Array(Math.round(rating)).fill("").map((value, index) => {
            return (
                <IconStarFilled class="fill-yellow-300 text-yellow-300" key={index} size={18} />
            )
        })

        const emptyIcons = Array(5 - Math.round(rating)).fill("").map((value, index) => {
            return (
                <IconStar class="fill-gray-300 text-gray-300 opacity-90" key={index+5} size={18} />
            )
        })

        return filledIcons.concat(emptyIcons)
        
    })

    const starRatings = () => {
        return renderStars()
    }

    // if (!displayDetails) {
    //     if (media && media.i18n_info_labels) {
    //         displayDetails = media.i18n_info_labels[media.i18n_info_labels?.length - 1]
    //     }
    // }

    if (mediaSource?.info_labels?.genre.length > 1) {
        genres = mediaSource?.info_labels.genre[0] + "/" + mediaSource.info_labels.genre[1]
    } else {
        genres = mediaSource?.info_labels?.genre[0]
    }

    return (
        //   <div class={`w-[240px] h-[330px] rounded-xl bg-black-1 backdrop-blur-2xl bg-opacity-60 cursor-pointer group relative overflow-clip duration-[400ms] ease-in-out border-4 border-transparent ${focused ? "!duration-300 border-yellow-300" : ""}`} ref={ref}>
        mediaSource ? (
            <div id={props.id} class={`media-card max-w-[250px] w-full xsm:max-w-[230px] mx-auto h-[340px] sm:h-[300px] rounded-xl bg-black-1 backdrop-blur-2xl bg-opacity-60 cursor-pointer group relative overflow-clip duration-[400ms] ease-in-out border-4 border-transparent`}>
                {
                    /* eslint-disable @next/next/no-img-element */
                    poster ?
                    // <Image width={300} height={400} class="w-full h-full max-h-full object-cover rounded-xl opacity-75" src={smallPoster(poster) || ""} alt={displayDetails?.plot} />
                    <img id={`${props.id}-poster`} width={300} height={400} class="w-full h-full max-h-full object-cover rounded-xl opacity-75" src={posterLink() || ""} alt={displayDetails?.title} onError={onImgError} />
                    : <IconPhoto size={85} class="text-yellow-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 fill-transparent group-hover:-fill-yellow-300 transition-all ease-linear duration-500" />
                    /* eslint-enable @next/next/no-img-element */
                }
                <div class={`w-full h-full absolute bottom-0 py-5 px-3 text-gray-100 bg-black bg-opacity-80 rounded-[11px] opacity-0 group-hover:opacity-100 invisible group-hover:visible ease-in-out duration-[400ms]`} onClick={() => props.showMediaInfo(props.media)}>
                    <div class="flex flex-col justify-between h-full">
                        <div>
                            <h5 class="text-[15px] sm:text-base lg:text-[17px] font-medium mb-1 group-hover:text-yellow-300 duration-300 ease-linear">{ displayDetails?.title || mediaSource.info_labels?.originaltitle }</h5>
                            <div class="flex flex-col sm:flex-row sm:items-center justify-between">
                                <p class="text-sm text-gray-400">{genres}</p>
                                <p class="text-sm text-gray-400 text-opacity-80">{premiere_date.getFullYear() || ""}</p>
                            </div>
                            <div class="flex items-center justify-between mt-2">
                                <div class="flex gap-0.5 scale-90 sm:scale-100">
                                    {starRatings()}
                                </div>
                                <p class="text-sm text-gray-300 text-opacity-70 font-medium leading-normal">({ voteCount })</p>
                            </div>
                        </div>
                        <div class="flex items-center justify-between">
                            <button class="p-3 flex items-center gap-4 bg-[rgba(249,249,249,0.20)] backdrop-blur-[5px] rounded-2xl text-[#F9F9F9] text-lg tracking-wide font-bold border-none !outline-none hover:bg-[#F9F9F9] hover:text-black-1 group">
                                <IconHeart width={20} class="group-hover:-fill-black-1" />
                            </button>

                            {/* <button class="px-10 py-3 bg-yellow-300 text-black-1 rounded-xl text-sm tracking-wide font-semibold border-2 border-transparent hover:bg-black-1 hover:border-yellow-300 hover:text-yellow-300">
                                Watch
                            </button> */}
                        </div>
                    </div>
                </div>
            </div>
        ) : (
            <div class="media-card max-w-[250px] w-full xsm:max-w-[230px] mx-auto h-[340px] sm:h-[300px] rounded-xl bg-black-1 backdrop-blur-2xl bg-opacity-60 cursor-pointer group relative overflow-clip duration-[400ms] ease-in-out border-4 border-transparent flex items-center justify-center animate-pulse">
                <IconPhoto size={40} color="text-gray-600" />
            </div>
        )
    )
}

  export default MediaCard