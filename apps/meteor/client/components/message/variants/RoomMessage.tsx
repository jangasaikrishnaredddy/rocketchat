import type { IMessage } from '@rocket.chat/core-typings';
import { Message, MessageLeftContainer, MessageContainer, CheckBox } from '@rocket.chat/fuselage';
import { useToggle } from '@rocket.chat/fuselage-hooks';
import type { ReactElement } from 'react';
import React, { memo } from 'react';

import Toolbox from '../../../views/room/MessageList/components/Toolbox';
import { useIsMessageHighlight } from '../../../views/room/MessageList/contexts/MessageHighlightContext';
import {
	useIsSelecting,
	useToggleSelect,
	useIsSelectedMessage,
	useCountSelected,
} from '../../../views/room/MessageList/contexts/SelectedMessagesContext';
import type { MessageWithMdEnforced } from '../../../views/room/MessageList/lib/parseMessageTextToAstMarkdown';
import { useMessageActions } from '../../../views/room/contexts/MessageContext';
import UserAvatar from '../../avatar/UserAvatar';
import StatusIndicators from '../StatusIndicators';
import RoomMessageContent from './room/RoomMessageContent';
import RoomMessageHeader from './room/RoomMessageHeader';
import RoomMessageIgnoredContent from './room/RoomMessageIgnoredContent';

type RoomMessageProps = {
	message: MessageWithMdEnforced;
	sequential: boolean;
	id: IMessage['_id'];
	unread: boolean;
	mention: boolean;
	all: boolean;
};

const RoomMessage = ({ message, sequential, all, mention, unread, ...props }: RoomMessageProps): ReactElement => {
	const isMessageHighlight = useIsMessageHighlight(message._id);
	const [ignored, toggleIgnoring] = useToggle((message as { ignored?: boolean }).ignored ?? false);
	const {
		actions: { openUserCard },
	} = useMessageActions();

	const selecting = useIsSelecting();
	const toggleSelected = useToggleSelect(message._id);
	const selected = useIsSelectedMessage(message._id);
	useCountSelected();

	return (
		<Message
			{...props}
			onClick={selecting ? toggleSelected : undefined}
			isSelected={selected}
			isEditing={isMessageHighlight}
			isPending={message.temp}
			sequential={sequential}
			data-qa-editing={isMessageHighlight}
			data-qa-selected={selected}
		>
			<MessageLeftContainer>
				{!sequential && message.u.username && !selecting && (
					<UserAvatar
						url={message.avatar}
						username={message.u.username}
						size={'x36'}
						onClick={openUserCard(message.u.username)}
						style={{ cursor: 'pointer' }}
					/>
				)}
				{selecting && <CheckBox checked={selected} onChange={toggleSelected} />}
				{sequential && <StatusIndicators message={message} />}
			</MessageLeftContainer>

			<MessageContainer>
				{!sequential && <RoomMessageHeader message={message} />}

				{!ignored ? (
					<RoomMessageContent id={message._id} message={message} unread={unread} mention={mention} all={all} sequential={sequential} />
				) : (
					<RoomMessageIgnoredContent onShowMessageIgnored={toggleIgnoring} />
				)}
			</MessageContainer>
			{!message.private && <Toolbox message={message} />}
		</Message>
	);
};

export default memo(RoomMessage);
