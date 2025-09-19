# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListActiveEvents*](#listactiveevents)
  - [*ListPhotosForEvent*](#listphotosforevent)
- [**Mutations**](#mutations)
  - [*CreateNewEvent*](#createnewevent)
  - [*AddCommentToPhoto*](#addcommenttophoto)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListActiveEvents
You can execute the `ListActiveEvents` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listActiveEvents(): QueryPromise<ListActiveEventsData, undefined>;

interface ListActiveEventsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListActiveEventsData, undefined>;
}
export const listActiveEventsRef: ListActiveEventsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listActiveEvents(dc: DataConnect): QueryPromise<ListActiveEventsData, undefined>;

interface ListActiveEventsRef {
  ...
  (dc: DataConnect): QueryRef<ListActiveEventsData, undefined>;
}
export const listActiveEventsRef: ListActiveEventsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listActiveEventsRef:
```typescript
const name = listActiveEventsRef.operationName;
console.log(name);
```

### Variables
The `ListActiveEvents` query has no variables.
### Return Type
Recall that executing the `ListActiveEvents` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListActiveEventsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListActiveEventsData {
  events: ({
    id: UUIDString;
    name: string;
    description?: string | null;
    eventDate?: DateString | null;
    qrCodeUrl: string;
  } & Event_Key)[];
}
```
### Using `ListActiveEvents`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listActiveEvents } from '@dataconnect/generated';


// Call the `listActiveEvents()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listActiveEvents();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listActiveEvents(dataConnect);

console.log(data.events);

// Or, you can use the `Promise` API.
listActiveEvents().then((response) => {
  const data = response.data;
  console.log(data.events);
});
```

### Using `ListActiveEvents`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listActiveEventsRef } from '@dataconnect/generated';


// Call the `listActiveEventsRef()` function to get a reference to the query.
const ref = listActiveEventsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listActiveEventsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.events);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.events);
});
```

## ListPhotosForEvent
You can execute the `ListPhotosForEvent` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listPhotosForEvent(vars: ListPhotosForEventVariables): QueryPromise<ListPhotosForEventData, ListPhotosForEventVariables>;

interface ListPhotosForEventRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListPhotosForEventVariables): QueryRef<ListPhotosForEventData, ListPhotosForEventVariables>;
}
export const listPhotosForEventRef: ListPhotosForEventRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listPhotosForEvent(dc: DataConnect, vars: ListPhotosForEventVariables): QueryPromise<ListPhotosForEventData, ListPhotosForEventVariables>;

interface ListPhotosForEventRef {
  ...
  (dc: DataConnect, vars: ListPhotosForEventVariables): QueryRef<ListPhotosForEventData, ListPhotosForEventVariables>;
}
export const listPhotosForEventRef: ListPhotosForEventRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listPhotosForEventRef:
```typescript
const name = listPhotosForEventRef.operationName;
console.log(name);
```

### Variables
The `ListPhotosForEvent` query requires an argument of type `ListPhotosForEventVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListPhotosForEventVariables {
  eventId: UUIDString;
}
```
### Return Type
Recall that executing the `ListPhotosForEvent` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListPhotosForEventData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListPhotosForEvent`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listPhotosForEvent, ListPhotosForEventVariables } from '@dataconnect/generated';

// The `ListPhotosForEvent` query requires an argument of type `ListPhotosForEventVariables`:
const listPhotosForEventVars: ListPhotosForEventVariables = {
  eventId: ..., 
};

// Call the `listPhotosForEvent()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listPhotosForEvent(listPhotosForEventVars);
// Variables can be defined inline as well.
const { data } = await listPhotosForEvent({ eventId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listPhotosForEvent(dataConnect, listPhotosForEventVars);

console.log(data.photos);

// Or, you can use the `Promise` API.
listPhotosForEvent(listPhotosForEventVars).then((response) => {
  const data = response.data;
  console.log(data.photos);
});
```

### Using `ListPhotosForEvent`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listPhotosForEventRef, ListPhotosForEventVariables } from '@dataconnect/generated';

// The `ListPhotosForEvent` query requires an argument of type `ListPhotosForEventVariables`:
const listPhotosForEventVars: ListPhotosForEventVariables = {
  eventId: ..., 
};

// Call the `listPhotosForEventRef()` function to get a reference to the query.
const ref = listPhotosForEventRef(listPhotosForEventVars);
// Variables can be defined inline as well.
const ref = listPhotosForEventRef({ eventId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listPhotosForEventRef(dataConnect, listPhotosForEventVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.photos);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.photos);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateNewEvent
You can execute the `CreateNewEvent` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createNewEvent(): MutationPromise<CreateNewEventData, undefined>;

interface CreateNewEventRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateNewEventData, undefined>;
}
export const createNewEventRef: CreateNewEventRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createNewEvent(dc: DataConnect): MutationPromise<CreateNewEventData, undefined>;

interface CreateNewEventRef {
  ...
  (dc: DataConnect): MutationRef<CreateNewEventData, undefined>;
}
export const createNewEventRef: CreateNewEventRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createNewEventRef:
```typescript
const name = createNewEventRef.operationName;
console.log(name);
```

### Variables
The `CreateNewEvent` mutation has no variables.
### Return Type
Recall that executing the `CreateNewEvent` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateNewEventData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateNewEventData {
  event_insert: Event_Key;
}
```
### Using `CreateNewEvent`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createNewEvent } from '@dataconnect/generated';


// Call the `createNewEvent()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createNewEvent();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createNewEvent(dataConnect);

console.log(data.event_insert);

// Or, you can use the `Promise` API.
createNewEvent().then((response) => {
  const data = response.data;
  console.log(data.event_insert);
});
```

### Using `CreateNewEvent`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createNewEventRef } from '@dataconnect/generated';


// Call the `createNewEventRef()` function to get a reference to the mutation.
const ref = createNewEventRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createNewEventRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.event_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.event_insert);
});
```

## AddCommentToPhoto
You can execute the `AddCommentToPhoto` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
addCommentToPhoto(vars: AddCommentToPhotoVariables): MutationPromise<AddCommentToPhotoData, AddCommentToPhotoVariables>;

interface AddCommentToPhotoRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddCommentToPhotoVariables): MutationRef<AddCommentToPhotoData, AddCommentToPhotoVariables>;
}
export const addCommentToPhotoRef: AddCommentToPhotoRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
addCommentToPhoto(dc: DataConnect, vars: AddCommentToPhotoVariables): MutationPromise<AddCommentToPhotoData, AddCommentToPhotoVariables>;

interface AddCommentToPhotoRef {
  ...
  (dc: DataConnect, vars: AddCommentToPhotoVariables): MutationRef<AddCommentToPhotoData, AddCommentToPhotoVariables>;
}
export const addCommentToPhotoRef: AddCommentToPhotoRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the addCommentToPhotoRef:
```typescript
const name = addCommentToPhotoRef.operationName;
console.log(name);
```

### Variables
The `AddCommentToPhoto` mutation requires an argument of type `AddCommentToPhotoVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface AddCommentToPhotoVariables {
  photoId: UUIDString;
  text: string;
}
```
### Return Type
Recall that executing the `AddCommentToPhoto` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `AddCommentToPhotoData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface AddCommentToPhotoData {
  comment_insert: Comment_Key;
}
```
### Using `AddCommentToPhoto`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, addCommentToPhoto, AddCommentToPhotoVariables } from '@dataconnect/generated';

// The `AddCommentToPhoto` mutation requires an argument of type `AddCommentToPhotoVariables`:
const addCommentToPhotoVars: AddCommentToPhotoVariables = {
  photoId: ..., 
  text: ..., 
};

// Call the `addCommentToPhoto()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await addCommentToPhoto(addCommentToPhotoVars);
// Variables can be defined inline as well.
const { data } = await addCommentToPhoto({ photoId: ..., text: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await addCommentToPhoto(dataConnect, addCommentToPhotoVars);

console.log(data.comment_insert);

// Or, you can use the `Promise` API.
addCommentToPhoto(addCommentToPhotoVars).then((response) => {
  const data = response.data;
  console.log(data.comment_insert);
});
```

### Using `AddCommentToPhoto`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, addCommentToPhotoRef, AddCommentToPhotoVariables } from '@dataconnect/generated';

// The `AddCommentToPhoto` mutation requires an argument of type `AddCommentToPhotoVariables`:
const addCommentToPhotoVars: AddCommentToPhotoVariables = {
  photoId: ..., 
  text: ..., 
};

// Call the `addCommentToPhotoRef()` function to get a reference to the mutation.
const ref = addCommentToPhotoRef(addCommentToPhotoVars);
// Variables can be defined inline as well.
const ref = addCommentToPhotoRef({ photoId: ..., text: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = addCommentToPhotoRef(dataConnect, addCommentToPhotoVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.comment_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.comment_insert);
});
```

