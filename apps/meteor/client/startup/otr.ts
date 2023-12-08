import { type IMessage, type AtLeast, isOTRMessage } from '@rocket.chat/core-typings';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';

import OTR from '../../app/otr/client/OTR';
import { OtrRoomState } from '../../app/otr/lib/OtrRoomState';
import { sdk } from '../../app/utils/client/lib/SDKClient';
import { t } from '../../app/utils/lib/i18n';
import { onClientBeforeSendMessage } from '../lib/onClientBeforeSendMessage';
import { onClientMessageReceived } from '../lib/onClientMessageReceived';

Meteor.startup(() => {
	Tracker.autorun(() => {
		if (!Meteor.userId()) {
			return;
		}

		sdk.stream('notify-user', [`${Meteor.userId()}/otr`], (type, data) => {
			if (!data.roomId || !data.userId || data.userId === Meteor.userId()) {
				return;
			}

			const otrRoom = OTR.getInstanceByRoomId(data.roomId);
			otrRoom?.onUserStream(type, data);
		});
	});

	onClientBeforeSendMessage.use(async (message: AtLeast<IMessage, '_id' | 'rid' | 'msg'>) => {
		const otrRoom = OTR.getInstanceByRoomId(message.rid);

		if (message.rid && otrRoom && otrRoom.getState() === OtrRoomState.ESTABLISHED) {
			const msg = await otrRoom.encrypt(message);
			return { ...message, msg, t: 'otr' };
		}
		return message;
	});

	onClientMessageReceived.use(async (message: IMessage & { notification?: boolean }) => {
		if (!isOTRMessage(message)) {
			return message;
		}

		if ('notification' in message) {
			return { ...message, msg: t('Encrypted_message') };
		}

		const otrRoom = OTR.getInstanceByRoomId(message.rid);

		if (otrRoom && otrRoom.getState() === OtrRoomState.ESTABLISHED) {
			const decrypted = await otrRoom.decrypt(message.msg);
			if (typeof decrypted === 'string') {
				return { ...message, msg: decrypted };
			}
			const { _id, text: msg, ack, ts, userId } = decrypted;

			if (ts) message.ts = ts;

			if (message.otrAck) {
				const otrAck = await otrRoom.decrypt(message.otrAck);
				if (typeof otrAck === 'string') {
					return { ...message, msg: otrAck };
				}

				if (ack === otrAck.text) {
					return { ...message, _id, t: 'otr-ack', msg };
				}
			} else if (userId !== Meteor.userId()) {
				const encryptedAck = await otrRoom.encryptText(ack);

				void sdk.call('updateOTRAck', { message, ack: encryptedAck });
			}

			return { ...message, _id, msg };
		}
		if (message.t === 'otr') message.msg = '';

		return message;
	});
});
