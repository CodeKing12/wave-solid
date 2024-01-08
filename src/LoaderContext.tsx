import { createContext, createSignal, useContext } from "solid-js";

const defaultContextValue = {
	showLoader: () => false,
	setShowLoader: (newVal: boolean) => {},
};

const LoaderContext = createContext(defaultContextValue);

export default function LoaderProvider(props: any) {
	const [showLoader, setShowLoader] = createSignal(false);

	return (
		<LoaderContext.Provider
			value={{
				showLoader,
				setShowLoader,
			}}
		>
			{props.children}
		</LoaderContext.Provider>
	);
}

export function useLoader() {
	const loaderContext = useContext(LoaderContext);
	if (!loaderContext) {
		throw Error("LoaderContext must be used inside of a Loader Provider");
	}

	return loaderContext;
}
