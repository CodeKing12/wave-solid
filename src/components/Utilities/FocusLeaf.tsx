import {
	FocusableComponentLayout,
	KeyPressDetails,
	useFocusable,
} from "@/spatial-nav";
import { formatStringAsId } from "@/utils/general";
import { JSXElement, createEffect, createSignal } from "solid-js";

type directions = "up" | "left" | "right" | "down";

interface FocusLeafProps {
	children: JSXElement;
	class?: string;
	focusedStyles?: string;
	isForm?: boolean;
	isFocusable?: boolean;
	customFocusKey?: string;
	hasFocusedChildStyles?: string | boolean;
	isFocusBoundary?: boolean;
	focusBoundaryDirections?: directions[];
	onFocus?: (layout: FocusableComponentLayout) => void;
	onEnterPress?: () => void;
	onArrowPress?: (direction: string, details: KeyPressDetails) => boolean;
}

export default function FocusLeaf(props: FocusLeafProps) {
	const [id, setId] = createSignal<string>("");

	const selectedFocusedChildStyles =
		typeof props.hasFocusedChildStyles === "boolean"
			? props.focusedStyles
			: props.hasFocusedChildStyles;

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

	const { setRef, focused, focusKey, hasFocusedChild } = useFocusable({
		onFocus: (focusDetails: FocusableComponentLayout) =>
			handleFocus(true, focusDetails),
		onBlur: () => handleFocus(false),
		onArrowPress: props.onArrowPress,
		onEnterPress: props.onEnterPress,
		get trackChildren() {
			return Boolean(props.hasFocusedChildStyles);
		},
		get focusable() {
			return props.isFocusable ?? true;
		},
		get focusKey() {
			const newKey = props.customFocusKey
				? props.customFocusKey
				: undefined;
			return newKey;
		},
		get isFocusBoundary() {
			return props.isFocusBoundary;
		},
		get focusBoundaryDirections() {
			return props.focusBoundaryDirections;
		},
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
			classList={{
				[selectedFocusedChildStyles ||
				"has-focused-child-but-no-styles"]: hasFocusedChild(),
			}}
		>
			{props.children}
		</div>
	);
}
