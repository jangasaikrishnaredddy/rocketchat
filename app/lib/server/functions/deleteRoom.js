import { Messages, Subscriptions, Rooms, Tasks } from '../../../models';
import { callbacks } from '../../../callbacks';
import { FileUpload } from '../../../file-upload/server';

export const deleteRoom = function(rid) {
	FileUpload.removeFilesByRoomId(rid);
	Messages.removeByRoomId(rid);
	Tasks.removeByRoomId(rid);
	callbacks.run('beforeDeleteRoom', rid);
	Subscriptions.removeByRoomId(rid);
	FileUpload.getStore('Avatars').deleteByRoomId(rid);
	callbacks.run('afterDeleteRoom', rid);
	return Rooms.removeById(rid);
};
