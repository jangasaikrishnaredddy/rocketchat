/* eslint-disable complexity */
import { IMessage } from '@rocket.chat/core-typings';
import React, { FC, memo } from 'react';

import MessageBodyRender from '../../../../components/Message/MessageBodyRender';
import { useMessageActions } from '../../contexts/MessageContext';
import { useParsedMessage } from '../hooks/useParsedMessage';

const MessageRender: FC<{ message: IMessage; isThreadPreview?: boolean }> = ({ message, isThreadPreview }) => {
	const {
		actions: { openRoom, openUserCard },
	} = useMessageActions();

	const tokens = useParsedMessage(message.msg);

	return (
		<MessageBodyRender
			onUserMentionClick={openUserCard}
			onChannelMentionClick={openRoom}
			mentions={message?.mentions || []}
			channels={message?.channels || []}
			tokens={tokens}
			isThreadPreview={isThreadPreview}
		/>
	);
};

export default memo(MessageRender);
