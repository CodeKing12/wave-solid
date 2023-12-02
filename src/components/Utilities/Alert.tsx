import {
	IconCircleCheckFilled,
	IconCircleXFilled,
} from "@tabler/icons-solidjs";
import { createSignal, onMount } from "solid-js";

export type AlertType = "success" | "error" | "warning" | "info";

export interface AlertData {
	title: string;
	message?: string;
	type: AlertType;
}

export interface AlertInfo extends AlertData {
	id: number;
}

export interface AlertProps extends AlertInfo {
	onRemove: (id: number) => void;
}

export default function Alert(props: AlertProps) {
	const [show, setShow] = createSignal(false);

	onMount(() => {
		// If show is passed in the moment the component is created, the animation doesn't show
		// So I set show after the component is created.
		setTimeout(() => setShow(true), 500);
		const timer = setTimeout(() => {
			props.onRemove(props.id);
		}, 5000);

		return () => {
			clearTimeout(timer);
		};
	});

	return (
		<div
			class="invisible flex -translate-y-[calc(100%+12px)] items-center space-x-3 rounded-[40px] border-2 bg-neutral-900 px-8 py-3.5 opacity-0 duration-500 ease-in-out"
			classList={{
				"!visible z-[9999] !translate-y-0 !opacity-100": show(),
				"border-yellow-300": props.type === "success",
				"border-red-500": props.type === "error",
			}}
		>
			<div class="rounded-full bg-black-1 p-2">
				{props.type === "success" ? (
					<IconCircleCheckFilled
						size="28px"
						class="text-yellow-300"
					/>
				) : props.type === "error" ? (
					<IconCircleXFilled size="28px" class="text-red-500" />
				) : (
					""
				)}
			</div>
			<div class="flex flex-col space-y-0.5">
				<p class="font-medium text-gray-200">{props.title}</p>
				{props.message ? (
					<p class="text-sm font-medium text-gray-500">
						{props.message}
					</p>
				) : (
					""
				)}
			</div>
		</div>
	);
}
