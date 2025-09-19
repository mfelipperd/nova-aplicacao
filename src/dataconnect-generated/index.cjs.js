const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'nova-aplicacao',
  location: 'us-central1'
};
exports.connectorConfig = connectorConfig;

const createNewEventRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateNewEvent');
}
createNewEventRef.operationName = 'CreateNewEvent';
exports.createNewEventRef = createNewEventRef;

exports.createNewEvent = function createNewEvent(dc) {
  return executeMutation(createNewEventRef(dc));
};

const listActiveEventsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListActiveEvents');
}
listActiveEventsRef.operationName = 'ListActiveEvents';
exports.listActiveEventsRef = listActiveEventsRef;

exports.listActiveEvents = function listActiveEvents(dc) {
  return executeQuery(listActiveEventsRef(dc));
};

const addCommentToPhotoRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AddCommentToPhoto', inputVars);
}
addCommentToPhotoRef.operationName = 'AddCommentToPhoto';
exports.addCommentToPhotoRef = addCommentToPhotoRef;

exports.addCommentToPhoto = function addCommentToPhoto(dcOrVars, vars) {
  return executeMutation(addCommentToPhotoRef(dcOrVars, vars));
};

const listPhotosForEventRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListPhotosForEvent', inputVars);
}
listPhotosForEventRef.operationName = 'ListPhotosForEvent';
exports.listPhotosForEventRef = listPhotosForEventRef;

exports.listPhotosForEvent = function listPhotosForEvent(dcOrVars, vars) {
  return executeQuery(listPhotosForEventRef(dcOrVars, vars));
};
