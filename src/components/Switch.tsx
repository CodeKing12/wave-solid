interface FormSwitchProps {
	value: boolean;
	onSwitch: () => void;
}

export default function FormSwitch(props: FormSwitchProps) {
	return (
		// The width of the whole switch should be the width of the round div inside * 2 + horizontal padding of switch
		// Here it is (32px * 2) + 4px = 72px
		<button
			class="w-[calc(74px+6px)] cursor-pointer rounded-full border-2 border-yellow-300 px-1 py-1"
			classList={{
				"bg-yellow-300": props.value,
				"opacity-80": !props.value,
			}}
			onClick={props.onSwitch}
		>
			<div
				class="relative h-8 w-8 rounded-full bg-yellow-300 duration-300 ease-in-out"
				classList={{
					"translate-x-[calc(100%+6px)] !bg-black-1": props.value,
				}}
			></div>
		</button>
	);
}
