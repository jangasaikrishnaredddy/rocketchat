import { useEffect } from 'react';

import { useStream } from '../../contexts/ServerContext';
import { IMessage } from '../../../definition/IMessage';
import {
	createFilterFromQuery,
	FieldExpression,
	Query,
} from '../../lib/minimongo';
import { MessageList } from '../../lib/lists/MessageList';
import { IRoom } from '../../../definition/IRoom';
import { IUser } from '../../../definition/IUser';

type RoomMessagesRidEvent = IMessage;

type NotifyRoomRidDeleteMessageEvent = { _id: IMessage['_id'] };

type NotifyRoomRidDeleteMessageBulkEvent = {
	rid: IMessage['rid'];
	excludePinned: boolean;
	ignoreDiscussion: boolean;
	ts: FieldExpression<Date>;
	users: string[];
};

const createDeleteCriteria = (
	params: NotifyRoomRidDeleteMessageBulkEvent,
): ((message: IMessage) => boolean) => {
	const query: Query<IMessage> = { ts: params.ts };

	if (params.excludePinned) {
		query.pinned = { $ne: true };
	}

	if (params.ignoreDiscussion) {
		query.drid = { $exists: false };
	}
	if (params.users && params.users.length) {
		query['u.username'] = { $in: params.users };
	}

	return createFilterFromQuery<IMessage>(query);
};

export const useStreamUpdatesForMessageList = (messageList: MessageList, uid: IUser['_id'] | null, rid: IRoom['_id'] | null): void => {
	const subscribeToRoomMessages = useStream('room-messages');
	const subscribeToNotifyRoom = useStream('notify-room');

	useEffect(() => {
		if (!uid || !rid) {
			messageList.clear();
			return;
		}

		const unsubscribeFromRoomMessages = subscribeToRoomMessages<RoomMessagesRidEvent>(rid, (message) => {
			messageList.pushOne(message);
		});

		const unsubscribeFromDeleteMessage = subscribeToNotifyRoom<NotifyRoomRidDeleteMessageEvent>(
			`${ rid }/deleteMessage`,
			({ _id: mid }) => {
				messageList.deleteOne(mid);
			},
		);

		const unsubscribeFromDeleteMessageBulk = subscribeToNotifyRoom<NotifyRoomRidDeleteMessageBulkEvent>(
			`${ rid }/deleteMessageBulk`,
			(params) => {
				const matchDeleteCriteria = createDeleteCriteria(params);
				messageList.deleteMany(matchDeleteCriteria);
			},
		);

		return (): void => {
			unsubscribeFromRoomMessages();
			unsubscribeFromDeleteMessage();
			unsubscribeFromDeleteMessageBulk();
		};
	}, [subscribeToRoomMessages, subscribeToNotifyRoom, uid, rid, messageList]);
};
