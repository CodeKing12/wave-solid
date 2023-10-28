// import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import { getDisplayDetails } from "./MediaCard";
import { SeriesObj } from "./MediaTypes";

interface SeasonProps {
    season: SeriesObj;
    isVisible?: boolean;
    // onFocus: ({ y }: { y: number }) => void;
    onClick: () => void;
}

export default function Season(props: SeasonProps) {
    const seasonDetails = getDisplayDetails(props.season._source.i18n_info_labels)
    const mediaType = props.season._source.info_labels.mediatype;
    // let { rating, voteCount } = getRatingAggr(props.season._source.ratings);
    // const { ref, focused } = useFocusable({
    //     onEnterPress: onClick,
    //     focusable: isVisible,
    //     focusKey: season._id,
    //     onFocus
    // });
    // console.log(seasonDetails, season)

    return (
        <div class={`w-[170px] h-[250px] relative rounded-xl cursor-pointer border-4 border-opacity-75 border-transparent duration-300 ease-in-out`} onClick={props.onClick}>
            {
                seasonDetails.art.poster ? <img class="absolute top-0 bottom-0 left-0 right-0 w-full h-full rounded-xl" src={seasonDetails?.art.poster} alt={seasonDetails?.plot} /> : ""
            }
            {
                // mediaType === "episode" ?
                // <h4 class="rounded-tl-xl absolute top-0 left-0 bg-yellow-500 bg-opacity-80 text-black-1 font-semibold text-sm py-1 px-2">Episode { season._source.info_labels.episode }</h4> 
                // : ""
            }
            <div class="w-full bg-black bg-opacity-80 px-3 py-3 text-white absolute bottom-0 rounded-b-[11px]">
                <h4>{mediaType === "season" ? props.season._source.info_labels.originaltitle || `Season ${props.season._source.info_labels.season}` : mediaType === "episode" ? seasonDetails.title : ""}</h4>
            </div>
        </div>
    )
}