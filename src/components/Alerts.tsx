import Alert from "./Alert";
import { useAlert } from "@/AlertContext";

function Alerts() {
	const { alerts, removeAlert } = useAlert();

	if (!alerts() || alerts().length === 0) {
		return null;
	}

	return (
		<div class="fixed left-1/2 top-0 z-[9999] flex h-fit -translate-x-1/2 flex-col gap-2.5 pt-3 duration-500 ease-in-out">
			{alerts().map((alert) => (
				<Alert
					id={alert.id}
					title={alert.title}
					message={alert.message}
					type={alert.type}
					onRemove={removeAlert}
				/>
			))}
		</div>
	);
}

export default Alerts;
