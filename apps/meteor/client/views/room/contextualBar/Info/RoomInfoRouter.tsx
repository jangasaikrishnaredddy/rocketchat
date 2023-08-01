import type { IRoom } from '@rocket.chat/core-typings';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import React, { useState } from 'react';

import { useRoom } from '../../contexts/RoomContext';
import { useRoomToolbox } from '../../contexts/RoomToolboxContext';
import EditRoomInfoWithData from './EditRoomInfo';
import RoomInfo from './RoomInfo';
import { useCanEditRoom } from './hooks/useCanEditRoom';

type RoomInfoRouterProps = {
	rid: IRoom['_id'];
	onClickBack?: () => void;
	onEnterRoom?: (room: IRoom) => void;
	resetState?: () => void;
};

const RoomInfoRouter = ({ rid, onClickBack, onEnterRoom, resetState }: RoomInfoRouterProps) => {
	const [isEditing, setIsEditing] = useState(false);

	const { closeTab } = useRoomToolbox();
	const room = useRoom();

	if (!room) {
		throw new Error('Room not found');
	}

	const canEdit = useCanEditRoom(room);
	const onClickEnterRoom = useMutableCallback(() => onEnterRoom?.(room));

	if (isEditing) {
		return <EditRoomInfoWithData rid={rid} onClickBack={() => setIsEditing(false)} />;
	}

	return (
		<RoomInfo
			room={room}
			icon={room.t === 'p' ? 'lock' : 'hashtag'}
			onClickBack={onClickBack}
			onClickEdit={canEdit ? () => setIsEditing(true) : undefined}
			onClickClose={closeTab}
			{...(Boolean(onEnterRoom) && {
				onClickEnterRoom,
			})}
			resetState={resetState}
		/>
	);
};

export default RoomInfoRouter;
