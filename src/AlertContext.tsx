import {
	createContext,
	useContext,
	createSignal,
	JSXElement,
	Accessor,
} from "solid-js";
import { AlertData, AlertInfo } from "./components/Alert";

// Define your AlertContextValues interface
interface AlertContextValues {
	alerts: Accessor<AlertInfo[]>;
	addAlert: (alert: AlertData) => void;
	removeAlert: (id: number) => void;
}

interface AlertProviderProps {
	children: JSXElement;
}

const initialContextValue: AlertContextValues = {
	alerts: () => [],
	addAlert: () => {},
	removeAlert: () => {},
};

// Create your context and provide an initial value
const AlertContext = createContext<AlertContextValues | undefined>(
	initialContextValue,
);

// Custom hook to consume the context
export function useAlert() {
	const context = useContext(AlertContext);
	if (!context) {
		throw new Error("useAlert must be used within an AlertProvider");
	}
	return context;
}

// Define your component for the AlertProvider
export function AlertProvider(props: AlertProviderProps) {
	const [alerts, setAlerts] = createSignal<AlertInfo[]>([]);

	const addAlert = (alert: AlertData) => {
		setAlerts((prevAlerts) => [
			...prevAlerts,
			{ ...alert, id: prevAlerts.length },
		]);
	};

	const removeAlert = (id: number) => {
		setAlerts((prevAlerts) =>
			prevAlerts.filter((alert) => alert.id !== id),
		);
	};

	return (
		<AlertContext.Provider
			value={{ alerts: alerts, addAlert, removeAlert }}
		>
			{props.children}
		</AlertContext.Provider>
	);
}
