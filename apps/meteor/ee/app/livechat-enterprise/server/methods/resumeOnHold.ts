import { Meteor } from 'meteor/meteor';
import { TAPi18n } from 'meteor/rocketchat:tap-i18n';
import type { ILivechatVisitor } from '@rocket.chat/core-typings';
import { LivechatVisitors, Messages } from '@rocket.chat/models';
import type { ServerMethods } from '@rocket.chat/ui-contexts';

import { LivechatRooms, LivechatInquiry, Users } from '../../../../../app/models/server';
import { RoutingManager } from '../../../../../app/livechat/server/lib/RoutingManager';
import { callbacks } from '../../../../../lib/callbacks';
import { methodDeprecationLogger } from '../../../../../app/lib/server/lib/deprecationWarningLogger';

async function resolveOnHoldCommentInfo(options: { clientAction: boolean }, room: any, onHoldChatResumedBy: any): Promise<string> {
	if (options.clientAction) {
		return TAPi18n.__('Omnichannel_on_hold_chat_resumed_manually', {
			user: onHoldChatResumedBy.name || onHoldChatResumedBy.username,
		});
	}
	const {
		v: { _id: visitorId },
	} = room;
	const visitor = await LivechatVisitors.findOneById<Pick<ILivechatVisitor, 'name' | 'username'>>(visitorId, {
		projection: { name: 1, username: 1 },
	});
	if (!visitor) {
		throw new Meteor.Error('error-invalid_visitor', 'Visitor Not found');
	}

	const guest = visitor.name || visitor.username;

	return TAPi18n.__('Omnichannel_on_hold_chat_automatically', { guest });
}

declare module '@rocket.chat/ui-contexts' {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface ServerMethods {
		'livechat:resumeOnHold'(roomId: string, options?: { clientAction: boolean }): Promise<unknown>;
	}
}

Meteor.methods<ServerMethods>({
	async 'livechat:resumeOnHold'(roomId, options = { clientAction: false }) {
		methodDeprecationLogger.warn(
			'Method "livechat:resumeOnHold" is deprecated and will be removed in next major version. Please use "livechat/room.resumeOnHold" API instead.',
		);

		const room = await LivechatRooms.findOneById(roomId);
		if (!room || room.t !== 'l') {
			throw new Meteor.Error('error-invalid-room', 'Invalid room', {
				method: 'livechat:resumeOnHold',
			});
		}

		if (!room.onHold) {
			throw new Meteor.Error('room-closed', 'Room is not OnHold', {
				method: 'livechat:resumeOnHold',
			});
		}

		const inquiry = LivechatInquiry.findOneByRoomId(roomId, {});
		if (!inquiry) {
			throw new Meteor.Error('inquiry-not-found', 'Error! No inquiry found for this room', {
				method: 'livechat:resumeOnHold',
			});
		}

		const {
			servedBy: { _id: agentId, username },
		} = room;
		await RoutingManager.takeInquiry(inquiry, { agentId, username }, options);

		const onHoldChatResumedBy = options.clientAction ? Meteor.user() : Users.findOneById('rocket.cat');

		const comment = await resolveOnHoldCommentInfo(options, room, onHoldChatResumedBy);
		await Messages.createOnHoldHistoryWithRoomIdMessageAndUser(roomId, onHoldChatResumedBy, comment, 'resume-onHold');

		Meteor.defer(() => callbacks.run('livechat:afterOnHoldChatResumed', room));
	},
});
