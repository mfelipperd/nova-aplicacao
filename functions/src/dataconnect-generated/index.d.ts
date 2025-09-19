import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface AddCommentToPhotoData {
  comment_insert: Comment_Key;
}

export interface AddCommentToPhotoVariables {
  photoId: UUIDString;
  text: string;
}

export interface Comment_Key {
  id: UUIDString;
  __typename?: 'Comment_Key';
}

export interface CreateNewEventData {
  event_insert: Event_Key;
}

export interface Event_Key {
  id: UUIDString;
  __typename?: 'Event_Key';
}

export interface ListActiveEventsData {
  events: ({
    id: UUIDString;
    name: string;
    description?: string | null;
    eventDate?: DateString | null;
    qrCodeUrl: string;
  } & Event_Key)[];
}

export interface ListPhotosForEventData {
  photos: ({
    id: UUIDString;
    imageUrl: string;
    caption?: string | null;
    uploader?: {
      displayName: string;
    };
      comments_on_photo: ({
        text: string;
        author?: {
          displayName: string;
        };
      })[];
  } & Photo_Key)[];
}

export interface ListPhotosForEventVariables {
  eventId: UUIDString;
}

export interface Photo_Key {
  id: UUIDString;
  __typename?: 'Photo_Key';
}

export interface ProjectionScreen_Key {
  id: UUIDString;
  __typename?: 'ProjectionScreen_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateNewEventRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateNewEventData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<CreateNewEventData, undefined>;
  operationName: string;
}
export const createNewEventRef: CreateNewEventRef;

export function createNewEvent(): MutationPromise<CreateNewEventData, undefined>;
export function createNewEvent(dc: DataConnect): MutationPromise<CreateNewEventData, undefined>;

interface ListActiveEventsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListActiveEventsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListActiveEventsData, undefined>;
  operationName: string;
}
export const listActiveEventsRef: ListActiveEventsRef;

export function listActiveEvents(): QueryPromise<ListActiveEventsData, undefined>;
export function listActiveEvents(dc: DataConnect): QueryPromise<ListActiveEventsData, undefined>;

interface AddCommentToPhotoRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddCommentToPhotoVariables): MutationRef<AddCommentToPhotoData, AddCommentToPhotoVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: AddCommentToPhotoVariables): MutationRef<AddCommentToPhotoData, AddCommentToPhotoVariables>;
  operationName: string;
}
export const addCommentToPhotoRef: AddCommentToPhotoRef;

export function addCommentToPhoto(vars: AddCommentToPhotoVariables): MutationPromise<AddCommentToPhotoData, AddCommentToPhotoVariables>;
export function addCommentToPhoto(dc: DataConnect, vars: AddCommentToPhotoVariables): MutationPromise<AddCommentToPhotoData, AddCommentToPhotoVariables>;

interface ListPhotosForEventRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListPhotosForEventVariables): QueryRef<ListPhotosForEventData, ListPhotosForEventVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListPhotosForEventVariables): QueryRef<ListPhotosForEventData, ListPhotosForEventVariables>;
  operationName: string;
}
export const listPhotosForEventRef: ListPhotosForEventRef;

export function listPhotosForEvent(vars: ListPhotosForEventVariables): QueryPromise<ListPhotosForEventData, ListPhotosForEventVariables>;
export function listPhotosForEvent(dc: DataConnect, vars: ListPhotosForEventVariables): QueryPromise<ListPhotosForEventData, ListPhotosForEventVariables>;

