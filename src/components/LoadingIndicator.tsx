import { useLoader } from "@/LoaderContext";

export default function LoadingIndicator() {
	const { showLoader } = useLoader();

	return (
		<div
			class="indicator fixed z-[9999] h-2.5 w-full origin-top scale-y-0 bg-black-1 bg-opacity-50 duration-300 ease-in-out"
			classList={{
				"scale-y-100": showLoader(),
			}}
		>
			<div
				class="moving-bar pauseAnimation absolute inset-y-0 left-0 w-1/4 bg-yellow-400"
				classList={{
					resumeAnimation: showLoader(),
				}}
			></div>
		</div>
	);
}
