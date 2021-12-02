import { IUIActionButton } from '@rocket.chat/apps-engine/definition/ui';

import { MessageAction, messageArgs } from '../../../ui-utils/client';
import { triggerActionButtonAction } from '../ActionManager';
import { applyButtonFilters } from './lib/applyButtonFilters';

const getIdForActionButton = ({ appId, actionId }: IUIActionButton): string => `${ appId }/${ actionId }`;

// eslint-disable-next-line no-void
export const onAdded = (button: IUIActionButton): void => void MessageAction.addButton({
	id: getIdForActionButton(button),
	icon: button.icon || '',
	label: button.nameI18n,
	context: button.when?.messageActionContext || ['message', 'message-mobile', 'threads', 'starred'],
	condition({ room }: any) {
		return applyButtonFilters(button, room);
	},
	async action() {
		const { msg } = messageArgs(this);
		triggerActionButtonAction({
			rid: msg.rid,
			mid: msg._id,
			actionId: button.actionId,
			appId: button.appId,
			payload: { context: button.context },
		});
	},
});

export const onRemoved = (button: IUIActionButton): void => MessageAction.removeButton(getIdForActionButton(button));
