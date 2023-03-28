import { Box, Callout, Message } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { useEndpoint, useRoute, useToastMessageDispatch, useTranslation } from '@rocket.chat/ui-contexts';
import { useQuery } from '@tanstack/react-query';
import React, { useMemo } from 'react';

import ContextMessage from './helpers/ContextMessage';

const UserMessages = ({
	userId,
	reload,
	onRedirect,
}: {
	userId: string;
	reload: () => void;
	onRedirect: (mid: string) => void;
}): JSX.Element => {
	const t = useTranslation();

	const moderationRoute = useRoute('moderation-console');

	const getUserMessages = useEndpoint('GET', '/v1/moderation.user.getMessageHistory');

	const query = useMemo(() => ({ userId }), [userId]);

	const dispatchToastMessage = useToastMessageDispatch();

	const {
		data: userMessages,
		refetch: reloadUserMessages,
		isLoading: isLoadingUserMessages,
		isSuccess: isSuccessUserMessages,
	} = useQuery(
		['userMessages', query],
		async () => {
			const messages = await getUserMessages(query);
			return messages;
		},
		{
			onError: (error) => {
				dispatchToastMessage({ type: 'error', message: error });
			},
		},
	);

	// opens up the 'reports' tab when the user clicks on a user in the 'users' tab

	const handleClick = useMutableCallback((id): void => {
		moderationRoute.push({
			context: 'reports',
			id,
		});
	});

	const handleChange = useMutableCallback(() => {
		reloadUserMessages();
		reload();
	});

	return (
		<Box display='flex' flexDirection='column' width='full' height='full' overflowY='auto' overflowX='hidden'>
			<Callout margin={15} title='Duplicate messages' type='warning' icon='lightning'>
				Following may contain duplicated messages sent across channels
			</Callout>{' '}
			{isLoadingUserMessages && <Message>{t('Loading')}</Message>}
			{isSuccessUserMessages &&
				userMessages.messages.map((message) => (
					<Box key={message._id}>
						<ContextMessage
							message={message.message}
							room={message.room}
							handleClick={handleClick}
							onRedirect={onRedirect}
							onChange={handleChange}
							onReload={reload}
						/>
					</Box>
				))}
		</Box>
	);
};

export default UserMessages;
