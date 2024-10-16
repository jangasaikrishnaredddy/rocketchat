import type { IVisitorEmail } from './IVisitorEmail';

export interface ILivechatContactChannel {
    name: string;
    verified: boolean;
    visitorId: string;
}

export interface ILivechatContactConflictingField {
    field: string;
    oldValue: string;
    newValue: string;
}

export interface ILivechatContact {
    _id: string;
    name: string;
    phones?: string[];
    emails?: IVisitorEmail[];
    contactManager?: string;
    unknown?: boolean;
    hasConflict?: boolean;
    conflictingFields?: ILivechatContactConflictingField[];
    customFields?: Record<string, string | unknown>;
    channels?: ILivechatContactChannel[];
}
