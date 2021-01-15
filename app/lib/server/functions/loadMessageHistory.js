import { settings } from '../../../settings/server';
import { Messages, Rooms, Subscriptions } from '../../../models/server';
import { normalizeMessagesForUser } from '../../../utils/server/lib/normalizeMessagesForUser';
import { Message } from '../../../../server/sdk';

const hideMessagesOfTypeServer = new Set();

settings.get('Hide_System_Messages', function(key, values) {
	const hiddenTypes = values.reduce((array, value) => [...array, ...value === 'mute_unmute' ? ['user-muted', 'user-unmuted'] : [value]], []);
	hideMessagesOfTypeServer.clear();
	hiddenTypes.forEach((item) => hideMessagesOfTypeServer.add(item));
});

export function loadMessageHistory({ userId, rid, end, limit = 20, ls }) {
	const room = Rooms.findOne(rid, { fields: { sysMes: 1, hideHistoryForNewMembers: 1 } });

	// TODO probably remove on chained event system
	const hiddenMessageTypes = Array.isArray(room && room.sysMes)
		? room.sysMes
		: Array.from(hideMessagesOfTypeServer.values());

	const options = {
		sort: {
			ts: -1,
		},
		limit,
	};

	if (!settings.get('Message_ShowEditedStatus')) {
		options.fields = {
			editedAt: 0,
		};
	}

	// let oldest;
	// 	if (room.hideHistoryForNewMembers) {
	// 		const sub = Subscriptions.findOneByRoomIdAndUserId(rid, fromId);

	// 		if (end) {
	// 			oldest = Math.max(sub.ts, end);
	// 		}
	// 	}

	// 	const records = Promise.await(Messages.get(fromId, { rid, oldest, queryOptions }));

	let oldest = end;
	if (room.hideHistoryForNewMembers) {
		const sub = Subscriptions.findOneByRoomIdAndUserId(rid, userId);

		oldest = Math.max(sub.ts, end || 0);
	}

	const records = Promise.await(Message.get(userId, { rid, excludeTypes: hiddenMessageTypes, oldest, queryOptions: options }));

	const messages = normalizeMessagesForUser(records, userId);

	let unreadNotLoaded = 0;
	let firstUnread;

	if (ls != null) {
		const firstMessage = messages[messages.length - 1];

		if ((firstMessage != null ? firstMessage.ts : undefined) > ls) {
			delete options.limit;
			const unreadMessages = Promise.await(Message.get(userId, {
				rid, excludeTypes: hiddenMessageTypes, latest: ls, oldest: firstMessage.ts, queryOptions: {
				limit: 1,
				sort: {
					ts: 1,
				},
				}
			}));

			firstUnread = unreadMessages[0];
			unreadNotLoaded = unreadMessages.length;
		}
	}

	return {
		messages,
		firstUnread,
		unreadNotLoaded,
	};
};
