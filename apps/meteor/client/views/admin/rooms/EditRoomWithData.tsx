import { Box, Skeleton } from '@rocket.chat/fuselage';
import { useEndpoint } from '@rocket.chat/ui-contexts';
import { useQuery } from '@tanstack/react-query';
import type { FC } from 'react';
import React, { useMemo } from 'react';

import EditRoom from './EditRoom';

const EditRoomWithData: FC<{ rid?: string; onReload: () => void }> = ({ rid, onReload }) => {
	const getAdminRooms = useEndpoint('GET', '/v1/rooms.adminRooms.getRoom');

	const { data, isLoading, error, refetch, isError } = useQuery(['rooms', useMemo(() => ({ rid }), [rid])], async () => {
		const rooms = await getAdminRooms({ rid });
		return rooms;
	});

	if (isLoading) {
		return (
			<Box w='full' p='x24'>
				<Skeleton mbe='x4' />
				<Skeleton mbe='x8' />
				<Skeleton mbe='x4' />
				<Skeleton mbe='x8' />
				<Skeleton mbe='x4' />
				<Skeleton mbe='x8' />
			</Box>
		);
	}

	if (isError) {
		return <>{(error as Error).message}</>;
	}

	const handleChange = (): void => {
		refetch();
		onReload();
	};

	const handleDelete = (): void => {
		onReload();
	};

	return data ? <EditRoom room={data} onChange={handleChange} onDelete={handleDelete} /> : null;
};

export default EditRoomWithData;
