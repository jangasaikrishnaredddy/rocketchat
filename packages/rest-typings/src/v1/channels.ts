import type { IMessage } from "@rocket.chat/core-typings";
import type { IRoom } from "@rocket.chat/core-typings";
import type { ITeam } from "@rocket.chat/core-typings";
import type { IGetRoomRoles, IUser } from "@rocket.chat/core-typings";
import type { PaginatedRequest } from "../helpers/PaginatedRequest";
import type { PaginatedResult } from "../helpers/PaginatedResult";

export type ChannelsEndpoints = {
  "channels.files": {
    GET: (params: {
      roomId: IRoom["_id"];
      offset: number;
      count: number;
      sort: string;
      query: string;
    }) => {
      files: IMessage[];
      total: number;
    };
  };
  "channels.members": {
    GET: (params: {
      roomId: IRoom["_id"];
      offset?: number;
      count?: number;
      filter?: string;
      status?: string[];
    }) => {
      count: number;
      offset: number;
      members: IUser[];
      total: number;
    };
  };
  "channels.history": {
    GET: (params: { roomId: string; count: number; latest?: string }) => {
      messages: IMessage[];
    };
  };
  "channels.archive": {
    POST: (params: { roomId: string }) => void;
  };
  "channels.unarchive": {
    POST: (params: { roomId: string }) => void;
  };
  "channels.create": {
    POST: (params: {
      name: string;
      members: string[];
      readOnly: boolean;
      extraData: {
        broadcast: boolean;
        encrypted: boolean;
        teamId?: string;
      };
    }) => {
      group: Partial<IRoom>;
    };
  };
  "channels.convertToTeam": {
    POST: (params: { channelId: string; channelName: string }) => {
      team: ITeam;
    };
  };
  "channels.info": {
    GET: (params: { roomId: string }) => { channel: IRoom };
  };
  "channels.counters": {
    GET: (params: { roomId: string }) => {
      joined: boolean;
      members: number;
      unreads: number;
      unreadsFrom: Date;
      msgs: number;
      latest: Date;
      userMentions: number;
    };
  };
  "channels.join": {
    POST: (params: { roomId: string; joinCode: string | null }) => {
      channel: IRoom;
    };
  };
  "channels.close": {
    POST: (params: { roomId: string }) => {};
  };
  "channels.kick": {
    POST: (params: { roomId: string; userId: string }) => {};
  };
  "channels.delete": {
    POST: (params: { roomId: string }) => {};
  };
  "channels.leave": {
    POST: (params: { roomId: string }) => {};
  };
  "channels.addModerator": {
    POST: (params: { roomId: string; userId: string }) => {};
  };
  "channels.removeModerator": {
    POST: (params: { roomId: string; userId: string }) => {};
  };
  "channels.addOwner": {
    POST: (params: { roomId: string; userId: string }) => {};
  };
  "channels.removeOwner": {
    POST: (params: { roomId: string; userId: string }) => {};
  };
  "channels.addLeader": {
    POST: (params: { roomId: string; userId: string }) => {};
  };
  "channels.removeLeader": {
    POST: (params: { roomId: string; userId: string }) => {};
  };
  "channels.roles": {
    GET: (params: { roomId: string }) => { roles: IGetRoomRoles[] };
  };
  "channels.messages": {
    GET: (params: {
      roomId: IRoom["_id"];
      query:
        | { "mentions._id": { $in: string[] } }
        | { "starred._id": { $in: string[] } }
        | { pinned: boolean };
      offset: number;
      sort: { ts: number };
    }) => {
      messages: IMessage[];
    };
  };
  "channels.addAll": {
    POST: (
      params: ({ roomId: string } | { roomName: string }) & {
        activeUserOnly?: boolean;
      }
    ) => {
      channel: IRoom;
    };
  };
  "channels.anonymousread": {
    GET: (
      params: PaginatedRequest<{ roomId: string } | { roomName: string }>
    ) => PaginatedResult<{
      messages: IMessage[];
    }>;
  };
};
