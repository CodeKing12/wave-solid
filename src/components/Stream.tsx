import { bytesToSize, secondsToHMS } from "@/utils/general";
import { Match, Show, Switch } from "solid-js";
// import { Barcode, Clock, Document, MessageText1, PlayCircle, Size, VolumeHigh } from "iconsax-react";
import { StreamObj } from "./MediaTypes";
import { IconAspectRatio, IconBadgeCc, IconFileBarcode, IconFileInfo, IconHourglassEmpty, IconLanguage, IconPlayerPlayFilled } from "@tabler/icons-solidjs";
// import { FocusDetails, useFocusable } from "@noriginmedia/norigin-spatial-navigation";

interface MediaStreamOptionProps { 
    stream: StreamObj,
    isEpisode?: boolean,
    authToken: string,
    // onFocus?: (focusDetails: FocusDetails) => void,
    onStreamClick: (isEnterpress?: boolean) => void
}

export default function MediaStreamOption(props: MediaStreamOptionProps) {
    // const { ref, focused } = useFocusable({
    //     onEnterPress: () => onStreamClick(true),
    //     onFocus,
    //     focusable: authToken && authToken?.length ? true : false
    // });

    return (
        <div class={`flex flex-col md:flex-row items-center justify-between ${props.isEpisode ? "gap-10" : "gap-10 md:gap-16 xl:gap-20"}`}>
            <div class={`flex flex-wrap xl:flex-nowrap justify-center md:justify-left gap-x-8 gap-y-4 xl:!gap-8 text-[15px] text-gray-300 text-opacity-50`}>
                <Show when={props.stream.video.length}>
                    <div class="duration flex flex-col gap-1.5 items-center">
                        <IconHourglassEmpty size={22} class="icon-stream" />
                        <p>
                            {
                                secondsToHMS(props.stream.video[0].duration)
                            }
                        </p>
                    </div> : ""
                </Show>

                <Show when={!props.isEpisode}>
                    <div class="size flex flex-col gap-1.5 items-center">
                        <IconFileInfo size={22} class="icon-stream" />
                        <p>
                            {
                                bytesToSize(props.stream.size)
                            }
                        </p>
                    </div>
                </Show>
                
                <Show when={props.stream.audio.length}>
                    <div class="audio flex flex-col gap-1.5 items-center">
                        <IconLanguage size={22} class="icon-stream" />
                        <p>
                            {
                                props.stream.audio.map(audio => audio?.language?.toUpperCase() || "").join("/")
                            }
                        </p>
                    </div>
                </Show>

                <Show when={props.stream.subtitles.length}>
                    <div class="subtitles flex flex-col gap-1.5 items-center">
                        <IconBadgeCc size={22} class="icon-stream" />
                        <p>
                            {
                                props.stream.subtitles.map(subtitle => subtitle?.language?.toUpperCase()).join("/")
                            }
                        </p>
                    </div> : ""
                </Show>
                <Show when={props.stream.video.length}>
                    <div class="resolution flex flex-col gap-1.5 items-center">
                        <IconAspectRatio size={22} class="icon-stream" />
                        <p>
                            {
                                props.stream.video.map(video => video.width + "×" + video.height).join(",")
                            }
                        </p>
                    </div>
                </Show>
                <Show when={props.stream.video.length && props.stream.audio.length && !props.isEpisode}>
                    <div class="codec flex flex-col gap-1.5 items-center">
                        <IconFileBarcode size={22} class="icon-stream" />
                        <p>
                            {
                                props.stream.video[0].codec + "+" + props.stream.audio[0].codec
                            }
                        </p>
                    </div>
                </Show>
            </div>

            <Switch>
                <Match when={props.isEpisode}>
                    <button onClick={() => {props.onStreamClick();}}>
                        <IconPlayerPlayFilled size={40} class={`text-yellow-300 duration-300 ease-in-out`} />
                    </button>
                </Match>

                <Match when={!props.isEpisode}>
                    <button class={`xl:h-16 xl:w-12 px-5 py-3 xl:!p-0 bg-yellow-300 text-sm text-black-1 rounded-md text-base tracking-wide font-bold border-2 border-transparent hover:bg-black-1 hover:border-yellow-300 hover:text-yellow-300 flex justify-center items-center gap-4`} onClick={() => props.onStreamClick()}>
                        <span class="xl:hidden font-semibold">Watch</span>
                        <IconPlayerPlayFilled size={28} />
                    </button>
                </Match>
            </Switch>
        </div>
    )
}