import { pollAPI, preserveTraktAuth, secondsToHMS } from "@/utils/general";
import { createEffect, createSignal } from "solid-js";
import { VerifyDeviceData } from "./TraktTypes";
import { createPolled, makeTimer } from "@solid-primitives/timer";
import { useAlert } from "@/AlertContext";
import { useSettings } from "@/SettingsContext";

interface TraktModalProps {
	show: boolean;
	traktAuth?: VerifyDeviceData;
	quitModal: (traktToken?: string) => void;
}

export default function AuthenticateTrakt(props: TraktModalProps) {
	const { addAlert } = useAlert();
	const { updateSetting } = useSettings();

	// Timer Logic
	let [countdown, setCountdown] = createSignal(0);
	let [pollingSpeed, setPollingSpeed] = createSignal(1);
	const [continuePolling, setContinuePolling] = createSignal<number | false>(
		false,
	);
	let disposeInterval = () => {};

	const isTimerComplete = () =>
		countdown() >= (props.traktAuth?.expires_in ?? 0);

	createEffect(() => {
		if (props.show) {
			disposeInterval = makeTimer(
				() => setCountdown(countdown() + 1),
				1000,
				setInterval,
			);
		}
	});

	createEffect(() => {
		if (props.traktAuth && isTimerComplete()) {
			disposeInterval();
			addAlert({
				type: "error",
				title: "Time up",
				message: "Request another device code to continue.",
			});
			props.quitModal();
		}
	});

	// Polling Logic
	async function pollingCallback() {
		if (props.traktAuth) {
			const authDetails = await pollAPI(props.traktAuth.device_code);

			if (isTimerComplete()) {
				setContinuePolling(false);
				props.quitModal();
			}

			if (
				typeof authDetails === "object" &&
				authDetails.hasOwnProperty("access_token")
			) {
				setContinuePolling(false);

				updateSetting("trakt_token", authDetails.access_token);
				preserveTraktAuth(authDetails);

				addAlert({
					type: "success",
					title: "Trakt Authentication Completed",
					message: "You can now sync your favorites Movies & Shows",
				});
				props.quitModal(authDetails.access_token);
			}

			if (
				typeof authDetails === "object" &&
				authDetails.hasOwnProperty("title")
			) {
				if (authDetails.stop === true) {
					setContinuePolling(false);
					addAlert({
						type: "error",
						title: authDetails.title,
						message: authDetails.message,
					});
					props.quitModal();
				} else if (authDetails.stop === 429) {
					// Make the speed go from 1 -> 1.5 -> 2 -> 2.5 and so on
					// Which makes the polling delay go from 5000ms -> 7500ms -> 10000ms -> 12500ms.
					setPollingSpeed((prevSpeed) => prevSpeed + 0.5);
				}
			}
		}
	}

	createEffect(() => {
		if (props.traktAuth && pollingSpeed() > 1) {
			setContinuePolling(
				props.traktAuth.interval * pollingSpeed() * 1000,
			);
		}
	});

	createEffect(() => {
		if (props.traktAuth) {
			setContinuePolling(props.traktAuth.interval * 1000);
			createPolled(pollingCallback, continuePolling);
		}
	});

	return (
		<div
			class="invisible fixed inset-0 z-[100] flex h-full w-full translate-y-10 items-center justify-center bg-black bg-opacity-50 opacity-0 duration-200 ease-linear"
			classList={{
				"!opacity-100 !visible !translate-y-0": props.show,
			}}
		>
			<div class="relative rounded-2xl bg-black-1 px-24 pb-[84px] pt-20">
				<div class="text-center">
					<p class="mx-auto mb-10 flex h-[68px] w-[68px] items-center justify-center rounded-full border-2 border-gray-300 text-lg font-medium text-gray-200">
						{secondsToHMS(
							(props.traktAuth?.expires_in ?? 0) - countdown(),
							true,
						)}
					</p>
					<h3 class="mb-8 text-5xl font-bold tracking-widest text-gray-300">
						{props.traktAuth?.user_code}
					</h3>
					<a
						class="block text-xl font-medium text-yellow-300 after:block after:h-[3px] after:w-full after:translate-y-3 after:bg-white after:bg-opacity-80 after:opacity-0 after:duration-300 after:ease-in-out hover:after:translate-y-0.5 hover:after:opacity-100"
						href={props.traktAuth?.verification_url}
						target="_blank"
					>
						{props.traktAuth?.verification_url}
					</a>
				</div>
			</div>
		</div>
	);
}
