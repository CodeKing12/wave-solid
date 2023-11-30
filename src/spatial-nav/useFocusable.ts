import {
	createSignal,
	createEffect,
	createMemo,
	onMount,
	onCleanup,
	Setter,
	Accessor,
	mergeProps,
} from "solid-js";
import noop from "lodash/noop";
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
const defaultProps = {
	focusable: true,
	saveLastFocusedChild: true,
	trackChildren: false,
	autoRestoreFocus: true,
	forceFocus: false,
	isFocusBoundary: false,
	focusBoundaryDirections: undefined,
	focusKey: undefined,
	preferredChildFocusKey: undefined,
	onEnterPress: noop,
	onEnterRelease: noop,
	onArrowPress: () => true,
	onFocus: noop,
	onBlur: noop,
	extraProps: undefined,
};

const useFocusableHook = <P>(
	props: UseFocusableConfig<P>,
): UseFocusableResult => {
	const config = mergeProps(defaultProps, props);

	// createEffect(() =>
	// 	console.log("Updated: ", config.focusKey, props, config),
	// );

	const onEnterPressHandler = (details?: KeyPressDetails) => {
		if (config.onEnterPress) {
			config.onEnterPress(config.extraProps, details);
		}
	};

	const onEnterReleaseHandler = () => {
		if (config.onEnterRelease) {
			config.onEnterRelease(config.extraProps);
		}
	};

	const onArrowPressHandler = (
		direction: string,
		details: KeyPressDetails,
	) => {
		if (config.onArrowPress) {
			config.onArrowPress(direction, config.extraProps, details);
		}
	};

	const onFocusHandler = (
		layout: FocusableComponentLayout,
		details: FocusDetails,
	) => {
		if (config.onFocus) {
			config.onFocus(layout, config.extraProps, details);
		}
	};

	const onBlurHandler = (
		layout: FocusableComponentLayout,
		details: FocusDetails,
	) => {
		if (config.onBlur) {
			config.onBlur(layout, config.extraProps, details);
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
		() => config.focusKey || uniqueId("sn:focusable-item-"),
	);

	onMount(() => {
		const node = ref();

		// const tempFocusDetails = {
		// 	focusKey: focusKey(),
		// 	node,
		// 	parentFocusKey,
		// 	preferredChildFocusKey: config.preferredChildFocusKey,
		// 	onEnterPress: onEnterPressHandler,
		// 	onEnterRelease: onEnterReleaseHandler,
		// 	onArrowPress: onArrowPressHandler,
		// 	onFocus: onFocusHandler,
		// 	onBlur: onBlurHandler,
		// 	onUpdateFocus: (isFocused = false) => setFocused(isFocused),
		// 	onUpdateHasFocusedChild: (isFocused = false) =>
		// 		setHasFocusedChild(isFocused),
		// 	saveLastFocusedChild: config.saveLastFocusedChild,
		// 	trackChildren: config.trackChildren,
		// 	isFocusBoundary: config.isFocusBoundary,
		// 	focusBoundaryDirections: config.focusBoundaryDirections,
		// 	autoRestoreFocus: config.autoRestoreFocus,
		// 	forceFocus: config.forceFocus,
		// 	focusable: config.focusable,
		// };

		SpatialNavigation.addFocusable({
			focusKey: focusKey(),
			node,
			parentFocusKey,
			preferredChildFocusKey: config.preferredChildFocusKey,
			onEnterPress: onEnterPressHandler,
			onEnterRelease: onEnterReleaseHandler,
			onArrowPress: onArrowPressHandler,
			onFocus: onFocusHandler,
			onBlur: onBlurHandler,
			onUpdateFocus: (isFocused = false) => setFocused(isFocused),
			onUpdateHasFocusedChild: (isFocused = false) =>
				setHasFocusedChild(isFocused),
			saveLastFocusedChild: config.saveLastFocusedChild,
			trackChildren: config.trackChildren,
			isFocusBoundary: config.isFocusBoundary,
			focusBoundaryDirections: config.focusBoundaryDirections,
			autoRestoreFocus: config.autoRestoreFocus,
			forceFocus: config.forceFocus,
			focusable: config.focusable,
		});
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
	// 		preferredChildFocusKey: config.preferredChildFocusKey,
	// 		onEnterPress: onEnterPressHandler,
	// 		onEnterRelease: onEnterReleaseHandler,
	// 		onArrowPress: onArrowPressHandler,
	// 		onFocus: onFocusHandler,
	// 		onBlur: onBlurHandler,
	// 		onUpdateFocus: (isFocused = false) => setFocused(isFocused),
	// 		onUpdateHasFocusedChild: (isFocused = false) =>
	// 			setHasFocusedChild(isFocused),
	// 		saveLastFocusedChild: config.saveLastFocusedChild || true,
	// 		trackChildren: config.trackChildren || false,
	// 		isFocusBoundary: config.isFocusBoundary || false,
	// 		focusBoundaryDirections: config.focusBoundaryDirections,
	// 		autoRestoreFocus: config.autoRestoreFocus || true,
	// 		forceFocus: config.forceFocus || false,
	// 		focusable: config.focusable || true,
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
			preferredChildFocusKey: config.preferredChildFocusKey,
			focusable: config.focusable ?? true,
			isFocusBoundary: config.isFocusBoundary ?? false,
			focusBoundaryDirections: config.focusBoundaryDirections,
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
