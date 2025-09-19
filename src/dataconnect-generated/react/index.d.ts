import { CreateNewEventData, ListActiveEventsData, AddCommentToPhotoData, AddCommentToPhotoVariables, ListPhotosForEventData, ListPhotosForEventVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateNewEvent(options?: useDataConnectMutationOptions<CreateNewEventData, FirebaseError, void>): UseDataConnectMutationResult<CreateNewEventData, undefined>;
export function useCreateNewEvent(dc: DataConnect, options?: useDataConnectMutationOptions<CreateNewEventData, FirebaseError, void>): UseDataConnectMutationResult<CreateNewEventData, undefined>;

export function useListActiveEvents(options?: useDataConnectQueryOptions<ListActiveEventsData>): UseDataConnectQueryResult<ListActiveEventsData, undefined>;
export function useListActiveEvents(dc: DataConnect, options?: useDataConnectQueryOptions<ListActiveEventsData>): UseDataConnectQueryResult<ListActiveEventsData, undefined>;

export function useAddCommentToPhoto(options?: useDataConnectMutationOptions<AddCommentToPhotoData, FirebaseError, AddCommentToPhotoVariables>): UseDataConnectMutationResult<AddCommentToPhotoData, AddCommentToPhotoVariables>;
export function useAddCommentToPhoto(dc: DataConnect, options?: useDataConnectMutationOptions<AddCommentToPhotoData, FirebaseError, AddCommentToPhotoVariables>): UseDataConnectMutationResult<AddCommentToPhotoData, AddCommentToPhotoVariables>;

export function useListPhotosForEvent(vars: ListPhotosForEventVariables, options?: useDataConnectQueryOptions<ListPhotosForEventData>): UseDataConnectQueryResult<ListPhotosForEventData, ListPhotosForEventVariables>;
export function useListPhotosForEvent(dc: DataConnect, vars: ListPhotosForEventVariables, options?: useDataConnectQueryOptions<ListPhotosForEventData>): UseDataConnectQueryResult<ListPhotosForEventData, ListPhotosForEventVariables>;
