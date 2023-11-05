import {
	IconCircleCheckFilled,
	IconCircleXFilled,
} from "@tabler/icons-solidjs";
import { createSignal, createEffect } from "solid-js";

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

export default function Alert({
	id,
	title,
	message,
	type,
	onRemove,
}: AlertProps) {
	const [show, setShow] = createSignal(false);

	createEffect(() => {
		// If show is passed in the moment the component is created, the animation doesn't show
		// So I set show after the component is created.
		setShow(true);
		const timer = setTimeout(() => {
			onRemove(id);
		}, 5000);

		return () => {
			clearTimeout(timer);
		};
	}, [id, onRemove]);

	return (
		<div
			class={`invisible flex -translate-y-[calc(100%+12px)] items-center gap-3 rounded-[40px] border-2 bg-neutral-900 px-4 py-2.5 opacity-0 duration-500 ease-in-out ${
				show() ? "!visible z-[9999] !translate-y-0 !opacity-100" : ""
			} ${
				type === "success"
					? "border-yellow-300"
					: type === "error"
					? "border-red-500"
					: ""
			}`}
		>
			<div class="rounded-full bg-black-1 bg-neutral-800 p-2">
				{type === "success" ? (
					<IconCircleCheckFilled
						size="28px"
						class="text-yellow-300"
					/>
				) : type === "error" ? (
					<IconCircleXFilled size="28px" class="text-red-500" />
				) : (
					""
				)}
			</div>
			<div class="flex flex-col gap-0.5">
				<p class="font-medium text-gray-200">{title}</p>
				{message ? (
					<p class="text-sm font-medium text-gray-500">{message}</p>
				) : (
					""
				)}
			</div>
		</div>
	);
}
