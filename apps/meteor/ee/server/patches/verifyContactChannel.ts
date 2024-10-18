import type { ILivechatContact } from '@rocket.chat/core-typings';
import { License } from '@rocket.chat/license';
import { LivechatContacts, LivechatInquiry, LivechatRooms } from '@rocket.chat/models';

import { verifyContactChannel, mergeContacts } from '../../../app/livechat/server/lib/Contacts';
import { saveQueueInquiry } from '../../../app/livechat/server/lib/QueueManager';

export const runVerifyContactChannel = async (
	_next: any,
	params: {
		contactId: string;
		field: string;
		value: string;
		visitorId: string;
		roomId: string;
	},
): Promise<ILivechatContact | null> => {
	const { contactId, field, value, visitorId, roomId } = params;

	await LivechatContacts.updateContactChannel(contactId, visitorId, {
		'unknown': false,
		'channels.$.verified': true,
		'channels.$.verifiedAt': new Date(),
		'channels.$.field': field,
		'channels.$.value': value,
	});

	await LivechatRooms.update({ _id: roomId }, { $set: { verified: true } });

	const mergeContactsResult = await mergeContacts(contactId, visitorId);

	const inquiry = await LivechatInquiry.findOneReadyByContactId(contactId);
	if (!inquiry) {
		throw new Error('error-invalid-inquiry');
	}

	await saveQueueInquiry(inquiry);

	return mergeContactsResult;
};

verifyContactChannel.patch(runVerifyContactChannel, () => License.hasModule('contact-id-verification'));
