import { createSignal, createEffect } from "solid-js";
import {
	AUTH_ENDPOINT,
	PATH_LOGIN,
	PATH_SALT,
	authAxiosConfig,
} from "./constants";
import { sha1 } from "@/utils/Sha";
import { md5crypt } from "@/utils/MD5";
import { parseXml } from "@/utils/general";
import axiosInstance from "@/utils/axiosInstance";
import { useAlert } from "@/AlertContext";
import { Spinner, SpinnerType } from "solid-spinner";
import { IconKey, IconX } from "@tabler/icons-solidjs";
import { FocusContext, useFocusable } from "@/spatial-nav";
import FocusLeaf from "./Utilities/FocusLeaf";

interface LoginProps {
	show: boolean;
	onLogin: (authenticated: boolean, token: string) => void;
	onClose: () => void;
}

const Login = function Login(props: LoginProps) {
	// console.log("Login is Re-rendering")

	createEffect(() => {
		function handleLoginEscape(event: KeyboardEvent) {
			if (event.code === "Escape" || event.keyCode === 27) {
				props.onClose();
			}
		}

		document.addEventListener("keydown", handleLoginEscape);

		return () => {
			document.removeEventListener("keydown", handleLoginEscape);
		};
	});

	const [username, setUsername] = createSignal("");
	const [password, setPassword] = createSignal("");
	const [isAuthenticating, setIsAuthenticating] = createSignal(false);
	const { setRef, focusSelf, focusKey } = useFocusable({
		focusable: props.show,
		trackChildren: true,
		autoRestoreFocus: true,
		isFocusBoundary: props.show,
		preferredChildFocusKey: "LOGIN_USERNAME_INPUT",
	});
	const { addAlert } = useAlert();

	createEffect(() => {
		if (props.show) {
			focusSelf();
		}
	});

	function loginWebshare(event?: any) {
		if (event) {
			event.preventDefault();
		}
		setIsAuthenticating(true);

		let salt = "";
		let token = "";
		axiosInstance
			.post(
				AUTH_ENDPOINT + PATH_SALT,
				{
					username_or_email: username(),
				},
				authAxiosConfig,
			)
			.then(function (response) {
				salt = parseXml(response.data, "salt");
				const hashedPassword = sha1(md5crypt(password(), salt));
				axiosInstance
					.post(
						AUTH_ENDPOINT + PATH_LOGIN,
						{
							username_or_email: username(),
							keep_logged_in: 1,
							password: hashedPassword,
						},
						authAxiosConfig,
					)
					.then(function (response) {
						token = parseXml(response.data, "token");

						if (token && token.length) {
							const expirationDate = new Date();
							// Set the token to expire after 3 days
							expirationDate.setDate(
								expirationDate.getDate() + 3,
							);

							const tokenData = {
								value: token,
								expiration: expirationDate.getTime(),
								// expiration: new Date().getTime() + 3 * 60 * 1000 // This sets it to expire after 3 mins (for testing purposes)
							};
							localStorage.setItem(
								"authToken",
								JSON.stringify(tokenData),
							);
							props.onLogin(true, token);
						} else {
							const message = parseXml(response.data, "message");
							addAlert({
								type: "error",
								title: message.endsWith(".")
									? message.slice(0, -1)
									: message,
							});
						}
						setIsAuthenticating(false);
					});
			})
			.catch(function () {
				addAlert({
					type: "error",
					title: "Login Unsuccessful",
					message: "Check your network",
				});
				setIsAuthenticating(false);
			});
	}

	return (
		<FocusContext.Provider value={focusKey()}>
			<div
				class={`login-modal invisible fixed bottom-0 top-0 z-0 flex h-full w-full items-center justify-center opacity-0 backdrop-blur-lg duration-300 ease-linear ${
					props.show ? "!visible !z-[110] !opacity-100" : ""
				}`}
				ref={setRef}
			>
				<div
					class={`invisible w-[450px] translate-y-10 rounded-2xl bg-[#191919] px-8 pb-10 pt-7 text-white opacity-0 duration-[400ms] ease-in-out ${
						props.show ? "!visible !translate-y-0 !opacity-100" : ""
					}`}
				>
					<div class="mb-10 flex justify-end">
						<FocusLeaf
							focusedStyles="on-svg-focus"
							onEnterPress={props.onClose}
						>
							<button
								class="cursor-pointer text-white hover:text-yellow-300"
								onClick={props.onClose}
							>
								<IconX
									class="duration-300 ease-in-out"
									size={35}
								/>
							</button>
						</FocusLeaf>
					</div>
					<div class="relative">
						<div
							class={`duration-300 ease-in-out ${
								props.show ? "visible opacity-100" : ""
							} ${
								isAuthenticating()
									? "!invisible !-translate-y-10 !opacity-0"
									: ""
							}`}
						>
							<h3 class="mb-2 text-3xl font-semibold text-gray-50">
								Log in to Webshare
							</h3>
							<p class="mb-10 text-sm text-gray-400">
								Enter your Webshare username and password
							</p>
							<form
								class="mb-4 flex w-full flex-col gap-4"
								onSubmit={loginWebshare}
							>
								<FocusLeaf
									isForm
									class="w-full"
									focusedStyles="login-input-focus"
									customFocusKey="LOGIN_USERNAME_INPUT"
								>
									<input
										class="w-full rounded-md border border-gray-300 border-opacity-40 bg-transparent px-2 py-3 text-[15px] text-gray-300 !outline-none placeholder:text-gray-400 placeholder:text-opacity-50 focus:border-yellow-300"
										type="text"
										placeholder="Username"
										onChange={(e) =>
											setUsername(e.target.value)
										}
									/>
								</FocusLeaf>

								<FocusLeaf
									isForm
									class="w-full"
									focusedStyles="login-input-focus"
								>
									<input
										class="w-full rounded-md border border-gray-300 border-opacity-40 bg-transparent px-2 py-3 text-[15px] text-gray-300 !outline-none placeholder:text-gray-400 placeholder:text-opacity-50 focus:border-yellow-300"
										type="password"
										placeholder="Password"
										onChange={(e) =>
											setPassword(e.target.value)
										}
									/>
								</FocusLeaf>

								<FocusLeaf
									focusedStyles="login-button-focus"
									onEnterPress={loginWebshare}
								>
									<button
										class="mt-5 flex items-center justify-center gap-2 rounded-xl border-2 border-transparent bg-yellow-300 px-10 py-5 text-base font-semibold tracking-wide text-black-1 hover:border-yellow-300 hover:bg-black-1 hover:text-yellow-300"
										onClick={loginWebshare}
										onSubmit={loginWebshare}
									>
										Authenticate
										<IconKey size={24} />
									</button>
								</FocusLeaf>
							</form>
						</div>
						<div
							class={`invisible absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-10 opacity-0 duration-300 ease-in-out ${
								isAuthenticating()
									? "-!translate-y-0 !visible !-translate-y-1/2 !opacity-100"
									: ""
							}`}
						>
							<Spinner
								type={SpinnerType.grid}
								width={30}
								height={30}
								color="#fde047"
							/>
						</div>
					</div>
				</div>
			</div>
		</FocusContext.Provider>
	);
};

export default Login;
