import {
	createSignal,
	createEffect,
	createMemo,
	onMount,
	onCleanup,
	Setter,
	Accessor,
} from "solid-js";
import noop from "lodash/noop";
import { Ref } from "solid-js";
import uniqueId from "lodash/uniqueId";
import {
	SpatialNavigation,
	FocusableComponentLayout,
	FocusDetails,
	KeyPressDetails,
	Direction,
} from "./SpatialNavigation";
import { useFocusContext } from "./useFocusContext";

export type EnterPressHandler<P = object> = (
	props: P,
	details: KeyPressDetails,
) => void;

export type EnterReleaseHandler<P = object> = (props: P) => void;

export type ArrowPressHandler<P = object> = (
	direction: string,
	props: P,
	details: KeyPressDetails,
) => boolean;

export type FocusHandler<P = object> = (
	layout: FocusableComponentLayout,
	props: P,
	details: FocusDetails,
) => void;

export type BlurHandler<P = object> = (
	layout: FocusableComponentLayout,
	props: P,
	details: FocusDetails,
) => void;

export interface UseFocusableConfig<P = object> {
	focusable?: boolean;
	saveLastFocusedChild?: boolean;
	trackChildren?: boolean;
	autoRestoreFocus?: boolean;
	forceFocus?: boolean;
	isFocusBoundary?: boolean;
	focusBoundaryDirections?: Direction[];
	focusKey?: string;
	preferredChildFocusKey?: string;
	onEnterPress?: EnterPressHandler<P>;
	onEnterRelease?: EnterReleaseHandler<P>;
	onArrowPress?: ArrowPressHandler<P>;
	onFocus?: FocusHandler<P>;
	onBlur?: BlurHandler<P>;
	extraProps?: P;
}

export interface UseFocusableResult {
	ref: Accessor<HTMLElement | undefined>; // <any> since we don't know which HTML tag is passed here
	setRef: Setter<HTMLElement | undefined>;
	focusSelf: (focusDetails?: FocusDetails) => void;
	focused: Accessor<boolean>;
	hasFocusedChild: Accessor<boolean>;
	focusKey: Accessor<string>;
}
// defaultProps = {
// 	focusable: true,
// 	saveLastFocusedChild: true,
// 	trackChildren: false,
// 	autoRestoreFocus: true,
// 	forceFocus: false,
// 	isFocusBoundary: false,
// 	focusBoundaryDirections,
// 	focusKey: propFocusKey,
// 	preferredChildFocusKey,
// 	onEnterPress = noop,
// 	onEnterRelease = noop,
// 	onArrowPress = () => true,
// 	onFocus = noop,
// 	onBlur = noop,
// 	extraProps,
// }

const useFocusableHook = <P>(
	props: UseFocusableConfig<P> = {},
): UseFocusableResult => {
	const onEnterPressHandler = (details: KeyPressDetails) => {
		if (props.onEnterPress) {
			props.onEnterPress(props.extraProps, details);
		}
	};

	const onEnterReleaseHandler = () => {
		if (props.onEnterRelease) {
			props.onEnterRelease(props.extraProps);
		}
	};

	const onArrowPressHandler = (
		direction: string,
		details: KeyPressDetails,
	) => {
		if (props.onArrowPress) {
			props.onArrowPress(direction, props.extraProps, details);
		}
	};

	const onFocusHandler = (
		layout: FocusableComponentLayout,
		details: FocusDetails,
	) => {
		if (props.onFocus) {
			props.onFocus(layout, props.extraProps, details);
		}
	};

	const onBlurHandler = (
		layout: FocusableComponentLayout,
		details: FocusDetails,
	) => {
		if (props.onBlur) {
			props.onBlur(layout, props.extraProps, details);
		}
	};

	// let ref: HTMLElement | undefined;

	// let ref: Ref<any> = (el: any) => {
	// 	return el;
	// };

	const [ref, setRef] = createSignal<HTMLElement | undefined>(undefined);
	const [focused, setFocused] = createSignal(false);
	const [hasFocusedChild, setHasFocusedChild] = createSignal(false);

	const parentFocusKey = useFocusContext();

	const focusKey = createMemo(
		() => props.focusKey || uniqueId("sn:focusable-item-"),
	);

	onMount(() => {
		const node = ref();

		const tempFocusDetails = {
			focusKey: focusKey(),
			node,
			parentFocusKey,
			preferredChildFocusKey: props.preferredChildFocusKey,
			onEnterPress: onEnterPressHandler,
			onEnterRelease: onEnterReleaseHandler,
			onArrowPress: onArrowPressHandler,
			onFocus: onFocusHandler,
			onBlur: onBlurHandler,
			onUpdateFocus: (isFocused = false) => setFocused(isFocused),
			onUpdateHasFocusedChild: (isFocused = false) =>
				setHasFocusedChild(isFocused),
			saveLastFocusedChild: props.saveLastFocusedChild ?? true,
			trackChildren: props.trackChildren || false,
			isFocusBoundary: props.isFocusBoundary || false,
			focusBoundaryDirections: props.focusBoundaryDirections,
			autoRestoreFocus: props.autoRestoreFocus ?? true,
			forceFocus: props.forceFocus || false,
			focusable: props.focusable ?? true,
		};

		SpatialNavigation.addFocusable(tempFocusDetails);
	});

	onCleanup(() => {
		SpatialNavigation.removeFocusable({
			focusKey: focusKey(),
		});
	});

	// const ref: Ref<any> = (el: any) => {
	// 	const node = el;
	// 	console.log(el);

	// 	SpatialNavigation.addFocusable({
	// 		focusKey: focusKey(),
	// 		node,
	// 		parentFocusKey,
	// 		preferredChildFocusKey: props.preferredChildFocusKey,
	// 		onEnterPress: onEnterPressHandler,
	// 		onEnterRelease: onEnterReleaseHandler,
	// 		onArrowPress: onArrowPressHandler,
	// 		onFocus: onFocusHandler,
	// 		onBlur: onBlurHandler,
	// 		onUpdateFocus: (isFocused = false) => setFocused(isFocused),
	// 		onUpdateHasFocusedChild: (isFocused = false) =>
	// 			setHasFocusedChild(isFocused),
	// 		saveLastFocusedChild: props.saveLastFocusedChild || true,
	// 		trackChildren: props.trackChildren || false,
	// 		isFocusBoundary: props.isFocusBoundary || false,
	// 		focusBoundaryDirections: props.focusBoundaryDirections,
	// 		autoRestoreFocus: props.autoRestoreFocus || true,
	// 		forceFocus: props.forceFocus || false,
	// 		focusable: props.focusable || true,
	// 	});
	// 	return el;
	// };
	// onMount(() => {
	// 	ref();
	// });

	createEffect(() => {
		const node = ref();
		// console.log("Updated: ", ref());

		SpatialNavigation.updateFocusable(focusKey(), {
			node,
			preferredChildFocusKey: props.preferredChildFocusKey,
			focusable: props.focusable || true,
			isFocusBoundary: props.isFocusBoundary || false,
			focusBoundaryDirections: props.focusBoundaryDirections,
			onEnterPress: onEnterPressHandler,
			onEnterRelease: onEnterReleaseHandler,
			onArrowPress: onArrowPressHandler,
			onFocus: onFocusHandler,
			onBlur: onBlurHandler,
		});
	});

	const focusSelf = (focusDetails: FocusDetails = {}) => {
		SpatialNavigation.setFocus(focusKey(), focusDetails);
	};

	return {
		ref,
		setRef,
		focusSelf,
		focused,
		hasFocusedChild,
		focusKey,
	};
};

export const useFocusable = useFocusableHook;
