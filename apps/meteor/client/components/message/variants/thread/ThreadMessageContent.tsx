import type { IMessage, ISubscription } from '@rocket.chat/core-typings';
import { isE2EEMessage } from '@rocket.chat/core-typings';
import type { TranslationKey } from '@rocket.chat/ui-contexts';
import { useTranslation } from '@rocket.chat/ui-contexts';
import type { ReactElement } from 'react';
import React, { memo } from 'react';

import { useUserData } from '../../../../hooks/useUserData';
import type { UserPresence } from '../../../../lib/presence';
import { useMessageListShowReadReceipt, useTranslateAttachments } from '../../../../views/room/MessageList/contexts/MessageListContext';
import { isOwnUserMessage } from '../../../../views/room/MessageList/lib/isOwnUserMessage';
import { useMessageActions, useMessageOembedIsEnabled, useMessageRunActionLink } from '../../../../views/room/contexts/MessageContext';
import MessageContentBody from '../../MessageContentBody';
import ReadReceiptIndicator from '../../ReadReceiptIndicator';
import Attachments from '../../content/Attachments';
import BroadcastMetrics from '../../content/BroadcastMetrics';
import Location from '../../content/Location';
import MessageActions from '../../content/MessageActions';
import Reactions from '../../content/Reactions';
import UiKitSurface from '../../content/UiKitSurface';
import UrlPreviews from '../../content/UrlPreviews';

type ThreadMessageContentProps = {
	message: IMessage;
	sequential: boolean;
	subscription?: ISubscription;
	id: IMessage['_id'];
};

const ThreadMessageContent = ({ message, subscription }: ThreadMessageContentProps): ReactElement => {
	const {
		broadcast,
		actions: { replyBroadcast },
	} = useMessageActions();

	const t = useTranslation();

	const runActionLink = useMessageRunActionLink();

	const oembedIsEnabled = useMessageOembedIsEnabled();
	const shouldShowReadReceipt = useMessageListShowReadReceipt();
	const user: UserPresence = { ...message.u, roles: [], ...useUserData(message.u._id) };

	const shouldShowReactionList = message.reactions && Object.keys(message.reactions).length;

	const isEncryptedMessage = isE2EEMessage(message);

	const messageAttachments = useTranslateAttachments({ message });

	return (
		<>
			{!message.blocks?.length && !!message.md?.length && (
				<>
					{(!isEncryptedMessage || message.e2e === 'done') && (
						<MessageContentBody md={message.md} mentions={message.mentions} channels={message.channels} />
					)}
					{isEncryptedMessage && message.e2e === 'pending' && t('E2E_message_encrypted_placeholder')}
				</>
			)}

			{message.blocks && <UiKitSurface mid={message._id} blocks={message.blocks} appId rid={message.rid} />}

			{messageAttachments && <Attachments attachments={messageAttachments} file={message.file} />}

			{oembedIsEnabled && !!message.urls?.length && <UrlPreviews urls={message.urls} />}

			{message.actionLinks?.length && (
				<MessageActions
					mid={message._id}
					actions={message.actionLinks.map(({ method_id: methodId, i18nLabel, ...action }) => ({
						methodId,
						i18nLabel: i18nLabel as TranslationKey,
						...action,
					}))}
					runAction={runActionLink(message)}
				/>
			)}

			{shouldShowReactionList && <Reactions message={message} />}

			{message.location && <Location location={message.location} />}

			{broadcast && !!user.username && !isOwnUserMessage(message, subscription) && (
				<BroadcastMetrics replyBroadcast={(): void => replyBroadcast(message)} mid={message._id} username={user.username} />
			)}

			{shouldShowReadReceipt && <ReadReceiptIndicator unread={message.unread} />}
		</>
	);
};

export default memo(ThreadMessageContent);
