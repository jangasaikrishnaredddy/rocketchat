import type { IRoom } from '@rocket.chat/core-typings';
import { useEndpoint } from '@rocket.chat/ui-contexts';
import type { UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const usePutChatOnHoldMutation = (
	options?: Omit<UseMutationOptions<void, Error, IRoom['_id']>, 'mutationFn'>,
): UseMutationResult<void, Error, IRoom['_id']> => {
	const putChatOnHold = useEndpoint('POST', '/v1/livechat/room.onHold');

	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (rid) => {
			await putChatOnHold({ roomId: rid });
		},

		...options,

		onSuccess: async (data, rid, context) => {
			await queryClient.invalidateQueries({
				queryKey: ['current-chats'],
			});
			await queryClient.invalidateQueries({
				queryKey: ['rooms', rid],
			});
			await queryClient.invalidateQueries({
				queryKey: ['subscriptions', { rid }],
			});
			return options?.onSuccess?.(data, rid, context);
		},
	});
};
