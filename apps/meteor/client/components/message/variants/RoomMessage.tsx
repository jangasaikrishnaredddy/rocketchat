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
import IgnoredContent from '../IgnoredContent';
import MessageHeader from '../MessageHeader';
import StatusIndicators from '../StatusIndicators';
import RoomMessageContent from './room/RoomMessageContent';

type RoomMessageProps = {
	message: MessageWithMdEnforced;
	sequential: boolean;
	unread: boolean;
	mention: boolean;
	all: boolean;
} & Record<`data-${string}`, string>;

const RoomMessage = ({ message, sequential, all, mention, unread, ...props }: RoomMessageProps): ReactElement => {
	const editing = useIsMessageHighlight(message._id);
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
			id={message._id}
			onClick={selecting ? toggleSelected : undefined}
			isSelected={selected}
			isEditing={editing}
			isPending={message.temp}
			sequential={sequential}
			data-qa-editing={editing}
			data-qa-selected={selected}
			{...props}
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
				{!sequential && <MessageHeader message={message} />}

				{ignored ? (
					<IgnoredContent onShowMessageIgnored={toggleIgnoring} />
				) : (
					<RoomMessageContent id={message._id} message={message} unread={unread} mention={mention} all={all} sequential={sequential} />
				)}
			</MessageContainer>
			{!message.private && <Toolbox message={message} />}
		</Message>
	);
};

export default memo(RoomMessage);
