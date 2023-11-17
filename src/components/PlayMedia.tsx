import "vidstack/player/styles/default/theme.css";
import "vidstack/player/styles/default/layouts/video.css";

import "vidstack/player";
import "vidstack/player/layouts";
import "vidstack/player/ui";
import { I18nInfoLabel } from "./MediaTypes";
import FocusLeaf from "./Utilities/FocusLeaf";
import { IconPlayerStopFilled } from "@tabler/icons-solidjs";
import { createEffect } from "solid-js";
import { FocusContext, useFocusable } from "@/spatial-nav";

export interface PlayMediaProps {
	show: boolean;
	url?: string;
	mediaFormat: string;
	mediaType: string;
	mediaDetails?: I18nInfoLabel;
	onExit: () => void;
}

export default function PlayMedia(props: PlayMediaProps) {
	const { setRef, focusSelf, focusKey, focused } = useFocusable({
		trackChildren: true,
		isFocusBoundary: true,
		focusable: props.show,
		// focusBoundaryDirections: ["left", "right"]
	});

	const mediaSrc = () => {
		if (props.url) {
			return props.url + "." + props.mediaFormat;
		}
		return props.url;
	};

	createEffect(() => {
		console.log(props.show);
		if (!props.show && !props.url) {
			// playerRef.current?.dispose()
			document.removeEventListener("keydown", (event) =>
				playerShortcuts(event),
			);
		}

		if (props.show) {
			focusSelf();
		}

		// let keyTimestamps = {
		//     arrowUpTimestamp: 0
		// }

		function playerShortcuts(event: KeyboardEvent) {
			// console.log("Doing Shortcuts")
			if (props.show) {
				if (event.code === "Escape" || event.keyCode === 27) {
					props.onExit();
				}
			}
		}

		if (props.show && props.url) {
			document.addEventListener("keydown", (event) =>
				playerShortcuts(event),
			);
		}

		return () => {
			document.removeEventListener("keydown", (event) =>
				playerShortcuts(event),
			);
		};
	});

	return (
		<FocusContext.Provider value={focusKey()}>
			<section
				class="invisible fixed bottom-0 top-0 h-full w-full bg-black opacity-0 duration-500 ease-in-out"
				classList={{ "!visible !opacity-100": props.show }}
				ref={setRef}
			>
				{/* <object id="av-player" type="application/avplayer"></object> */}
				<media-player
					class="!h-full"
					title={props.mediaDetails?.title}
					src={mediaSrc()}
					poster={props.mediaDetails?.art.poster}
					keyTarget={props.show ? "document" : "player"}
					autoplay
				>
					<media-provider></media-provider>
					<media-video-layout></media-video-layout>
				</media-player>

				<FocusLeaf
					class="quitPlayer absolute right-0 top-0 z-[99999]"
					focusedStyles="[&>button]:!bg-black-1 [&>button]:!text-yellow-300 [&>button]:!border-yellow-300"
					isFocusable={Boolean(props.url?.length)}
					onEnterPress={props.onExit}
				>
					<button
						class="flex h-12 w-12 items-center justify-center border-[3px] border-transparent bg-yellow-300 hover:border-yellow-300 hover:bg-black-1 hover:text-yellow-300"
						onClick={props.onExit}
					>
						<IconPlayerStopFilled size={26} />
					</button>
				</FocusLeaf>
			</section>
		</FocusContext.Provider>
	);
}
