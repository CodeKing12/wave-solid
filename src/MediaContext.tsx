import {
	Accessor,
	createContext,
	createEffect,
	createSignal,
	useContext,
} from "solid-js";
import { MediaObj } from "./components/MediaTypes";
import { PageType } from "./components/Sidebar";

interface MediaContextObj {
	pageMedia: Accessor<MediaObj[]>;
	currentPage: Accessor<PageType>;
	currentPagination: Accessor<number>;
	updatePage: (newPage: PageType) => void;
	updatePageMedia: (newMedia: MediaObj[]) => void;
	updatePagination: (newCurrentPage: number) => void;
}

export const initialValue: MediaContextObj = {
	pageMedia: () => [],
	currentPage: () => "movies",
	currentPagination: () => 0,
	updatePage: (page) => {},
	updatePageMedia: (media) => {},
	updatePagination: (visiblePage) => {},
};

export const MediaContext = createContext(initialValue);

export function MediaProvider(props: any) {
	const [media, setMedia] = createSignal<MediaObj[]>([]);
	const [page, setPage] = createSignal<PageType>("");
	const [pagination, setPagination] = createSignal(0);

	// createEffect(() => console.log(media()))

	const providerValue = {
		pageMedia: media,
		currentPage: page,
		currentPagination: pagination,
		updatePage: (newPage: PageType) => {
			setPage(newPage);
		},
		updatePageMedia: (newMedia: MediaObj[]) => {
			setMedia(newMedia);
		},
		updatePagination: (newCurrentPage: number) => {
			setPagination(newCurrentPage);
		},
	};
	return (
		<MediaContext.Provider value={providerValue}>
			{props.children}
		</MediaContext.Provider>
	);
}

export function useMediaContext() {
	const mediaContext = useContext(MediaContext);
	if (!mediaContext) {
		throw new Error(
			"useMediaContext must be used inside an MediaContext Provider",
		);
	}

	return mediaContext;
}
