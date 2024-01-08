import {
	IconCircleCheckFilled,
	IconCircleXFilled,
	IconInfoCircleFilled,
} from "@tabler/icons-solidjs";
import { Match, Switch, onMount } from "solid-js";

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
	onMount(() => {
		const timer = setTimeout(() => {
			props.onRemove(props.id);
		}, 5000);

		return () => {
			clearTimeout(timer);
		};
	});

	return (
		<div
			class="alert flex items-center space-x-3 rounded-[40px] border-2 bg-neutral-900 px-8 py-3.5 duration-500 ease-in-out"
			classList={{
				"border-yellow-300": props.type === "success",
				"border-red-500": props.type === "error",
				"border-alert-blue": props.type === "info",
			}}
		>
			<div class="rounded-full bg-black-1 p-2">
				<Switch>
					<Match when={props.type === "success"}>
						<IconCircleCheckFilled
							size="28px"
							class="text-yellow-300"
						/>
					</Match>
					<Match when={props.type === "error"}>
						<IconCircleXFilled size="28px" class="text-red-500" />
					</Match>
					<Match when={props.type === "info"}>
						<IconInfoCircleFilled
							size="28px"
							class="text-alert-blue"
						/>
					</Match>
				</Switch>
			</div>
			<div class="flex flex-col space-y-0.5">
				<p
					class="font-medium text-gray-200"
					innerHTML={props.title}
				></p>
				{props.message ? (
					<p
						class="text-sm font-medium text-gray-500"
						innerHTML={props.message}
					></p>
				) : (
					""
				)}
			</div>
		</div>
	);
}
