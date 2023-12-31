import { For, Show } from "solid-js";
import Alert from "./Alert";
import { useAlert } from "@/AlertContext";
import { TransitionGroup } from "solid-transition-group";
import "@/css/transitions.css";

function Alerts() {
	const { alerts, removeAlert } = useAlert();

	return (
		<Show when={alerts() || alerts().length}>
			<div class="fixed left-1/2 top-0 z-[9999] flex h-fit -translate-x-1/2 flex-col space-y-2.5 pt-3 duration-500 ease-in-out">
				<TransitionGroup name="fade-fromTop">
					<For each={alerts()}>
						{(alert) => (
							<Alert
								id={alert.id}
								title={alert.title}
								message={alert.message}
								type={alert.type}
								onRemove={removeAlert}
							/>
						)}
					</For>
				</TransitionGroup>
			</div>
		</Show>
	);
}

export default Alerts;
