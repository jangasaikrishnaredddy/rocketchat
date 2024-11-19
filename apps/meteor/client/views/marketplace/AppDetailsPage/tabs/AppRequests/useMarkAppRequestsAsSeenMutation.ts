import { useEndpoint } from '@rocket.chat/ui-contexts';
import { useQueryClient, useMutation } from '@tanstack/react-query';

import { marketplaceQueryKeys } from '../../../queryKeys';

export const useMarkAppRequestsAsSeenMutation = () => {
	const markSeen = useEndpoint('POST', '/apps/app-request/markAsSeen');
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (unseenRequests: string[]) => {
			if (unseenRequests.length === 0) {
				return;
			}

			return markSeen({ unseenRequests });
		},
		retry: false,
		onSuccess: () => {
			queryClient.invalidateQueries(marketplaceQueryKeys.all);
		},
	});
};
