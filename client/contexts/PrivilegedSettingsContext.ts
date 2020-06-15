import { useDebouncedCallback, useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { Tracker } from 'meteor/tracker';
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useSubscription } from 'use-subscription';

import { useReactiveValue } from '../hooks/useReactiveValue';
import { useBatchSettingsDispatch } from './SettingsContext';
import { useToastMessageDispatch } from './ToastMessagesContext';
import { useTranslation, useLoadLanguage } from './TranslationContext';
import { useUser } from './UserContext';

type PrivilegedSettingId = string;

type PrivilegedSetting = {
	_id: PrivilegedSettingId;
	type: string;
	blocked: boolean;
	enableQuery: unknown;
	group: PrivilegedSettingId;
	section: string;
	changed: boolean;
	value: unknown;
	packageValue: unknown;
	packageEditor: unknown;
	editor: unknown;
	sorter: string;
	i18nLabel: string;
	disabled?: boolean;
};

type EqualityFunction<T> = (a: T, b: T) => boolean;

// TODO: split editing into another context
type PrivilegedSettingsContextValue = {
	authorized: boolean;
	loading: boolean;
	persistedSettings: Map<PrivilegedSettingId, PrivilegedSetting>;
	settings: Map<PrivilegedSettingId, PrivilegedSetting>;
	subscribers: Set<() => void>;
	hydrate: (changes: any[]) => void;
	isDisabled: (setting: PrivilegedSetting) => boolean;
};

export const PrivilegedSettingsContext = createContext<PrivilegedSettingsContextValue>({
	authorized: false,
	loading: false,
	settings: new Map(),
	persistedSettings: new Map(),
	subscribers: new Set(),
	hydrate: () => undefined,
	isDisabled: () => false,
});

export const usePrivilegedSettingsAuthorized = (): boolean =>
	useContext(PrivilegedSettingsContext).authorized;

export const useIsPrivilegedSettingsLoading = (): boolean =>
	useContext(PrivilegedSettingsContext).loading;

export const usePrivilegedSettingsGroups = (filter?: string): any => {
	const { persistedSettings, subscribers } = useContext(PrivilegedSettingsContext);
	const t = useTranslation();

	const filterPredicate = useMemo((): ((setting: PrivilegedSetting) => boolean) => {
		if (!filter) {
			return (): boolean => true;
		}

		try {
			const filterRegex = new RegExp(filter, 'i');
			return (setting: PrivilegedSetting): boolean => filterRegex.test(t(setting.i18nLabel || setting._id));
		} catch (e) {
			return (setting: PrivilegedSetting): boolean => t(setting.i18nLabel || setting._id).slice(0, filter.length) === filter;
		}
	}, []);

	const getCurrentValue = useCallback(() => {
		const groupIds = Array.from(new Set(
			Array.from(persistedSettings.values())
				.filter(filterPredicate)
				.map((setting) => setting.group || setting._id),
		));

		return Array.from(persistedSettings.values())
			.filter(({ type, group, _id }) => type === 'group' && groupIds.includes(group || _id))
			.sort((a, b) => t(a.i18nLabel || a._id).localeCompare(t(b.i18nLabel || b._id)));
	}, [persistedSettings, filterPredicate]);

	const subscribe = useCallback((cb) => {
		const handleUpdate = (): void => {
			cb(getCurrentValue());
		};

		subscribers.add(handleUpdate);

		return (): void => {
			subscribers.delete(handleUpdate);
		};
	}, [getCurrentValue]);

	return useSubscription(useMemo(() => ({
		getCurrentValue,
		subscribe,
	}), [getCurrentValue, subscribe]));
};

const useSelector = <T>(
	selector: () => T,
	equalityFunction: EqualityFunction<T> = Object.is,
): T | null => {
	const { subscribers } = useContext(PrivilegedSettingsContext);
	const [value, setValue] = useState<T | null>(() => selector());

	const handleUpdate = useMutableCallback(() => {
		const newValue = selector();

		if (!value || !equalityFunction(newValue, value)) {
			setValue(newValue);
		}
	});

	useEffect(() => {
		subscribers.add(handleUpdate);

		return (): void => {
			subscribers.delete(handleUpdate);
		};
	}, [handleUpdate]);

	useLayoutEffect(() => {
		handleUpdate();
	});

	return value;
};

export const usePrivilegedSettingsGroup = (groupId: PrivilegedSettingId): any => {
	const { persistedSettings, settings, hydrate } = useContext(PrivilegedSettingsContext);
	const group = useSelector(() => Array.from(settings.values()).find(({ _id, type }) => _id === groupId && type === 'group'));

	const filterSettings = (settings: any[]): any[] => settings.filter(({ group }) => group === groupId);

	const changed = useSelector(() => filterSettings(Array.from(settings.values())).some(({ changed }) => changed));
	const sections = useSelector(() => Array.from(new Set(filterSettings(Array.from(settings.values())).map(({ section }) => section || ''))), (a, b) => a.length === b.length && a.join() === b.join());

	const batchSetSettings = useBatchSettingsDispatch();

	const dispatchToastMessage = useToastMessageDispatch() as any;
	const t = useTranslation() as (key: string, ...args: any[]) => string;
	const loadLanguage = useLoadLanguage() as any;
	const user = useUser() as any;

	const save = useMutableCallback(async () => {
		const groupSettings = filterSettings(Array.from(settings.values()));

		const changes = groupSettings.filter(({ changed }) => changed)
			.map(({ _id, value, editor }) => ({ _id, value, editor }));

		if (changes.length === 0) {
			return;
		}

		try {
			await batchSetSettings(changes);

			if (changes.some(({ _id }) => _id === 'Language')) {
				const lng = user?.language
					|| changes.filter(({ _id }) => _id === 'Language').shift()?.value
					|| 'en';

				try {
					await loadLanguage(lng);
					dispatchToastMessage({ type: 'success', message: t('Settings_updated', { lng }) });
				} catch (error) {
					dispatchToastMessage({ type: 'error', message: error });
				}
				return;
			}

			dispatchToastMessage({ type: 'success', message: t('Settings_updated') });
		} catch (error) {
			dispatchToastMessage({ type: 'error', message: error });
		}
	});

	const cancel = useMutableCallback(() => {
		const groupSettings = filterSettings(Array.from(settings.values()));
		const groupPersistedSettings = filterSettings(Array.from(persistedSettings.values()));

		const changes = groupSettings.filter(({ changed }) => changed)
			.map((field) => {
				const { _id, value, editor } = groupPersistedSettings.find(({ _id }) => _id === field._id);
				return { _id, value, editor, changed: false };
			});

		hydrate(changes);
	});

	return group && { ...group, sections, changed, save, cancel };
};

export const usePrivilegedSettingsSection = (groupId: string, sectionName?: string): any => {
	const { persistedSettings, settings, hydrate, isDisabled } = useContext(PrivilegedSettingsContext);

	sectionName = sectionName || '';

	const filterSettings = (settings: any[]): any[] =>
		settings.filter(({ group, section }) => group === groupId && ((!sectionName && !section) || (sectionName === section)));

	const canReset = useSelector(() => filterSettings(Array.from(settings.values())).some(({ value, packageValue }) => JSON.stringify(value) !== JSON.stringify(packageValue)));
	const settingsIds = useSelector(() => filterSettings(Array.from(settings.values())).map(({ _id }) => _id), (a, b) => a.length === b.length && a.join() === b.join());

	const reset = useMutableCallback(() => {
		const sectionSettings = filterSettings(Array.from(settings.values()))
			.filter((setting) => Tracker.nonreactive(() => !isDisabled(setting))); // Ignore disabled settings
		const sectionPersistedSettings = filterSettings(Array.from(persistedSettings.values()));

		const changes = sectionSettings.map((setting) => {
			const { _id, value, packageValue, packageEditor } = sectionPersistedSettings.find(({ _id }) => _id === setting._id);
			return {
				_id,
				value: packageValue,
				editor: packageEditor,
				changed: JSON.stringify(packageValue) !== JSON.stringify(value),
			};
		});

		hydrate(changes);
	});

	return {
		name: sectionName,
		canReset,
		settings: settingsIds,
		reset,
	};
};

export const usePrivilegedSettingActions = (_id: PrivilegedSettingId): {
	update: () => void;
	reset: () => void;
} => {
	const { persistedSettings, hydrate } = useContext(PrivilegedSettingsContext);

	const update: (() => void) = useDebouncedCallback(({ value, editor }) => {
		const persistedSetting = persistedSettings.get(_id);

		const changes = [{
			_id,
			...value !== undefined && { value },
			...editor !== undefined && { editor },
			changed: JSON.stringify(persistedSetting?.value) !== JSON.stringify(value) || JSON.stringify(editor) !== JSON.stringify(persistedSetting?.editor),
		}];

		hydrate(changes);
	}, 100, [hydrate, persistedSettings, _id]);

	const reset: (() => void) = useDebouncedCallback(() => {
		const persistedSetting = persistedSettings.get(_id);
		const changes = [{
			_id: persistedSetting?._id,
			value: persistedSetting?.packageValue,
			editor: persistedSetting?.packageEditor,
			changed: JSON.stringify(persistedSetting?.packageValue) !== JSON.stringify(persistedSetting?.value) || JSON.stringify(persistedSetting?.packageEditor) !== JSON.stringify(persistedSetting?.editor),
		}];

		hydrate(changes);
	}, 100, [hydrate, persistedSettings, _id]);

	return { update, reset };
};

export const usePrivilegedSettingsSectionChangedState = (groupId: PrivilegedSettingId, sectionName: string): boolean => {
	const { settings } = useContext(PrivilegedSettingsContext);
	return !!useSelector(() =>
		Array.from(settings.values()).some(({ group, section, changed }) =>
			group === groupId && ((!sectionName && !section) || (sectionName === section)) && changed));
};

export const usePrivilegedSetting = (_id: PrivilegedSettingId): PrivilegedSetting | null | undefined => {
	const { settings, isDisabled } = useContext(PrivilegedSettingsContext);

	const setting = useSelector(() => settings.get(_id));
	const disabled = useReactiveValue(() => (setting ? isDisabled(setting) : false), [setting?.blocked, setting?.enableQuery]) as unknown as boolean;

	if (!setting) {
		return null;
	}

	return {
		...setting,
		disabled,
	};
};
