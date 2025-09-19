import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'nova-aplicacao',
  location: 'us-central1'
};

export const createNewEventRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateNewEvent');
}
createNewEventRef.operationName = 'CreateNewEvent';

export function createNewEvent(dc) {
  return executeMutation(createNewEventRef(dc));
}

export const listActiveEventsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListActiveEvents');
}
listActiveEventsRef.operationName = 'ListActiveEvents';

export function listActiveEvents(dc) {
  return executeQuery(listActiveEventsRef(dc));
}

export const addCommentToPhotoRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AddCommentToPhoto', inputVars);
}
addCommentToPhotoRef.operationName = 'AddCommentToPhoto';

export function addCommentToPhoto(dcOrVars, vars) {
  return executeMutation(addCommentToPhotoRef(dcOrVars, vars));
}

export const listPhotosForEventRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListPhotosForEvent', inputVars);
}
listPhotosForEventRef.operationName = 'ListPhotosForEvent';

export function listPhotosForEvent(dcOrVars, vars) {
  return executeQuery(listPhotosForEventRef(dcOrVars, vars));
}

