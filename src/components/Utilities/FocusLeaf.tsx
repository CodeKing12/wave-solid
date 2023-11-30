import { FocusableComponentLayout, useFocusable } from "@/spatial-nav";
import { formatStringAsId } from "@/utils/general";
import { JSXElement, createEffect, createSignal } from "solid-js";

interface FocusLeafProps {
	children: JSXElement;
	class?: string;
	focusedStyles?: string;
	isForm?: boolean;
	isFocusable?: boolean;
	customFocusKey?: string;
	onFocus?: (layout: FocusableComponentLayout) => void;
	onEnterPress?: () => void;
}

export default function FocusLeaf(props: FocusLeafProps) {
	const [id, setId] = createSignal<string>("");

	const handleFocus = (
		focused: boolean,
		focusDetails?: FocusableComponentLayout,
	) => {
		if (props.isForm && id()) {
			const input: HTMLInputElement | null = document.querySelector(
				`#${id()} input`,
			);
			if (input) {
				focused ? input.focus() : input.blur();
			}
		}
		if (focused && props.onFocus && focusDetails) {
			props.onFocus(focusDetails);
			console.log(focusDetails);
		}
	};

	const { setRef, focused, focusKey } = useFocusable({
		onFocus: (focusDetails: FocusableComponentLayout) =>
			handleFocus(true, focusDetails),
		onBlur: () => handleFocus(false),
		onEnterPress: props.onEnterPress,
		focusable: props.isFocusable,
		focusKey: props.customFocusKey ? props.customFocusKey : undefined,
	});

	createEffect(() => {
		setId(formatStringAsId(focusKey()));
	});

	return (
		<div
			ref={setRef}
			id={props.isForm ? id() : undefined}
			class={`${props.class || ""} ${
				focused() ? props.focusedStyles : ""
			}`}
		>
			{props.children}
		</div>
	);
}
