import 'meteor/templating';
import type { Blaze } from 'meteor/blaze';
import type { ReactiveVar } from 'meteor/reactive-var';

declare module 'meteor/blaze' {
	namespace Blaze {
		interface Template {
			events(
				eventsMap: Record<
					string,
					(
						this: TInstance,
						event: {
							[K in keyof JQuery.TriggeredEvent]: any;
						},
						instance: TInstance,
					) => void
				>,
			): void;
		}
	}
}

declare module 'meteor/templating' {
	interface TemplateStatic {
		emojiPicker: Blaze.Template<any, Blaze.TemplateInstance<any>>;
		customFieldsForm: Blaze.Template<any, Blaze.TemplateInstance<any>>;
		ExternalFrameContainer: Blaze.Template<any, Blaze.TemplateInstance<any>>;
		broadcastView: Blaze.Template<any, Blaze.TemplateInstance<any>>;
		liveStreamBroadcast: Blaze.Template<any, Blaze.TemplateInstance<any>>;
		liveStreamTab: Blaze.Template<any, Blaze.TemplateInstance<any>>;
		liveStreamView: Blaze.Template<any, Blaze.TemplateInstance<any>>;
		inputAutocomplete: Blaze.Template<any, Blaze.TemplateInstance<any>>;
		textareaAutocomplete: Blaze.Template<any, Blaze.TemplateInstance<any>>;
		_autocompleteContainer: Blaze.Template<any, Blaze.TemplateInstance<any>>;
		_noMatch: Blaze.Template<any, Blaze.TemplateInstance<any>>;
		authorize: Blaze.Template<any, Blaze.TemplateInstance<any>>;
		oauth404: Blaze.Template<any, Blaze.TemplateInstance<any>>;
		DefaultSearchResultTemplate: Blaze.Template<any, Blaze.TemplateInstance<any>>;
		DefaultSuggestionItemTemplate: Blaze.Template<any, Blaze.TemplateInstance<any>>;
		RocketSearch: Blaze.Template<any, Blaze.TemplateInstance<any>>;
		icon: Blaze.Template<any, Blaze.TemplateInstance<any>>;
		CodeMirror: Blaze.Template<any, Blaze.TemplateInstance<any>>;
		photoswipeContent: Blaze.Template<any, Blaze.TemplateInstance<any>>;
		roomSearch: Blaze.Template<typeof AutoComplete, Blaze.TemplateInstance<typeof AutoComplete>>;
		roomSearchEmpty: Blaze.Template<any, Blaze.TemplateInstance<any>>;
		avatar: Blaze.Template<any, Blaze.TemplateInstance<any>>;
		username: Blaze.Template<
			Record<string, never>,
			Blaze.TemplateInstance<Record<string, never>> & {
				customFields: ReactiveVar<Record<
					string,
					{
						required?: boolean;
						maxLength?: number;
						minLength?: number;
					}
				> | null>;
				username: ReactiveVar<{
					ready: boolean;
					username: string;
					empty?: boolean;
					error?: boolean;
					invalid?: boolean;
					escaped?: string;
					blocked?: boolean;
					unavailable?: boolean;
				}>;
				validate: () => unknown;
			}
		>;
		error: Blaze.Template<any, Blaze.TemplateInstance<any>>;
		loading: Blaze.Template<any, Blaze.TemplateInstance<any>>;
		message: Blaze.Template<any, Blaze.TemplateInstance<any>>;
		messagePopup: Blaze.Template<any, Blaze.TemplateInstance<any>>;
		messagePopupChannel: Blaze.Template<any, Blaze.TemplateInstance<any>>;
		messagePopupConfig: Blaze.Template<any, Blaze.TemplateInstance<any>>;
		messagePopupEmoji: Blaze.Template<any, Blaze.TemplateInstance<any>>;
		messagePopupSlashCommand: Blaze.Template<any, Blaze.TemplateInstance<any>>;
		messagePopupSlashCommandPreview: Blaze.Template<any, Blaze.TemplateInstance<any>>;
		messagePopupUser: Blaze.Template<any, Blaze.TemplateInstance<any>>;
		rc_modal: Blaze.Template<any, Blaze.TemplateInstance<any>>;
		popout: Blaze.Template<any, Blaze.TemplateInstance<any>>;
		popover: Blaze.Template<any, Blaze.TemplateInstance<any>>;
		messagePopupCannedResponse: Blaze.Template<any, Blaze.TemplateInstance<any>>;

		instance<TTemplateName extends keyof TemplateStatic>(): TemplateStatic[TTemplateName] extends Blaze.Template<any, infer I> ? I : never;
	}
}
