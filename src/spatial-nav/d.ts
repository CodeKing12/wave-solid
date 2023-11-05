import { createSignal, onCleanup, createEffect, createMemo } from "solid-js";
import { uniqueId } from "lodash-es";
import { SpatialNavigation } from "./SpatialNavigation";
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
	ref: HTMLDivElement;
	focusSelf: (focusDetails?: FocusDetails) => void;
	focused: boolean;
	hasFocusedChild: boolean;
	focusKey: string;
}

function useFocusableHook<P>({
	focusable = true,
	saveLastFocusedChild = true,
	trackChildren = false,
	autoRestoreFocus = true,
	forceFocus = false,
	isFocusBoundary = false,
	focusBoundaryDirections,
	focusKey: propFocusKey,
	preferredChildFocusKey,
	onEnterPress = () => {},
	onEnterRelease = () => {},
	onArrowPress = () => true,
	onFocus = () => {},
	onBlur = () => {},
	extraProps,
}: UseFocusableConfig<P> = {}): UseFocusableResult {
	const onEnterPressHandler = (details: KeyPressDetails) => {
		onEnterPress(extraProps, details);
	};

	const onEnterReleaseHandler = () => {
		onEnterRelease(extraProps);
	};

	const onArrowPressHandler = (
		direction: string,
		details: KeyPressDetails,
	) => {
		return onArrowPress(direction, extraProps, details);
	};

	const onFocusHandler = (
		layout: FocusableComponentLayout,
		details: FocusDetails,
	) => {
		onFocus(layout, extraProps, details);
	};

	const onBlurHandler = (
		layout: FocusableComponentLayout,
		details: FocusDetails,
	) => {
		onBlur(layout, extraProps, details);
	};

	const ref = createSignal<HTMLDivElement>(null);
	const [focused, setFocused] = createSignal(false);
	const [hasFocusedChild, setHasFocusedChild] = createSignal(false);

	const parentFocusKey = useFocusContext();

	const focusKey = createMemo(
		() => propFocusKey || uniqueId("sn:focusable-item-"),
	);

	const focusSelf = (focusDetails: FocusDetails = {}) => {
		SpatialNavigation.setFocus(focusKey(), focusDetails);
	};

	createEffect(() => {
		const node = ref()[0];

		SpatialNavigation.addFocusable({
			focusKey: focusKey(),
			node,
			parentFocusKey,
			preferredChildFocusKey,
			onEnterPress: onEnterPressHandler,
			onEnterRelease: onEnterReleaseHandler,
			onArrowPress: onArrowPressHandler,
			onFocus: onFocusHandler,
			onBlur: onBlurHandler,
			onUpdateFocus: (isFocused = false) => setFocused(isFocused),
			onUpdateHasFocusedChild: (isFocused = false) =>
				setHasFocusedChild(isFocused),
			saveLastFocusedChild,
			trackChildren,
			isFocusBoundary,
			focusBoundaryDirections,
			autoRestoreFocus,
			forceFocus,
			focusable,
		});

		return () => {
			SpatialNavigation.removeFocusable({
				focusKey: focusKey(),
			});
		};
	});

	createEffect(() => {
		const node = ref()[0];

		SpatialNavigation.updateFocusable(focusKey(), {
			node,
			preferredChildFocusKey,
			focusable,
			isFocusBoundary,
			focusBoundaryDirections,
			onEnterPress: onEnterPressHandler,
			onEnterRelease: onEnterReleaseHandler,
			onArrowPress: onArrowPressHandler,
			onFocus: onFocusHandler,
			onBlur: onBlurHandler,
		});
	});

	return {
		ref,
		focusSelf,
		focused: focused(),
		hasFocusedChild: hasFocusedChild(),
		focusKey: focusKey(),
	};
}

export const useFocusable = useFocusableHook;
