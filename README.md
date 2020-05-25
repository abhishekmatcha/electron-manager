# electron-manager

#### A complete toolkit for electron applications

## Installation

Using npm:
```bash
$ npm i --save electron-manager
```

Then use it in your app:

```js
import electronManager from 'electron-manager';

const { logger } =  electronManager;
electronManager.init();

...
logger.init();

logger.log('This is a test message...!!!');
```

## Initialization

`electron-manager` uses `process.env.NODE_ENV` in various places to determine the node environment. Make sure that `NODE_ENV` is available in all the processes(both main and renderer). If `NODE_ENV` is not available, then you can set the mode by using the init method.

* **init (main + renderer)**

| Params | Type    | Default Value          | Description                            |
|--------|---------|------------------------|----------------------------------------|
| config | object  | {}                     | electron-manager initial configuration |

* `config`

| Params | Type    | Default Value          | Description                      |
|--------|---------|------------------------|----------------------------------|
| isDev  | boolean | `process.env.NODE_ENV` | Flag to set the node environment |

## Modules

* **StorageManager**
* **WindowManager**


### StorageManager

The `StorageManager` is used to store the application data into the disk storage. The default storage location will the `AppData` folder of the installed application.

#### Methods

* **init (main)**

Initialize the module in the main process.

| Params | Type   | Default Value | Description                          |
|--------|--------|---------------|--------------------------------------|
| config | object | {}            | storageManager initial configuration |

* `config`

| Params          | Type   | Default Value             | Description              |
|-----------------|--------|---------------------------|--------------------------|
| storageLocation | string | `app.getPath('userData')` | Default storage location |

> **Note:** *You can create storage files in custom locations by setting location property in the individual configurations.*


* **createStorage (main + render)**

| Params | Type   | Default Value | Description           |
|--------|--------|---------------|-----------------------|
| config | object | {}            | Storage configuration |

The configuration can be of type array or object. If you have multiple storages the pass the configuration as an array of objects. For single storage, it will take an object as a valid parameter.

* `config`

| Params       | Type   | Default Value | Description              |
|--------------|--------|---------------|--------------------------|
| extension    | string | 'json'        | Storage file extension   |
| initialState | any    | {}            | Initial state/data       |
| location     | string | `userData`    | Storage location         |
| name(*)      | string | undefined     | Storage name             |

> **Note:** *Storage name should meet all OS level validations*

```js
// Main process
import { storageManager } from 'electron-manager';
...
storageManager.init();

...
storageManager.createStorage([
  {
    name: 'settings',
    extension: 'json',
    initialState: {}
  },
  {
    name: 'firstRunLock',
    extension: 'LOCK'
  }
])
```

* **read (main + render)**

Read data from the file storage.

| Params         | Type   | Default Value | Description        |
|----------------|--------|---------------|--------------------|
| storageName(*) | string | undefined     | Storage name       |

```js
import { storageManager } from 'electron-manager';

...
storageManager.read('settings')
  .then((data) => {
    console.log('StorageManager | Read : Success', data)
  })
  .catch((err) => {
    console.error('StorageManager | Read : Error', err)
  })
```

* **write (main + render)**

Write data to the file storage.

| Params         | Type   | Default Value | Description        |
|----------------|--------|---------------|--------------------|
| storageName(*) | string | undefined     | Storage name       |

```js
import { storageManager } from 'electron-manager';

...
storageManager.write('settings', {systemSettings: false})
  .then((data) => {
    console.log('StorageManager | Write : Success', data)
  })
  .catch((err) => {
    console.error('StorageManager | Write : Error', err)
  })
```

### WindowManager

WindowManager can be used for creating and managing windows in an Electron application. WindowManager internally handles the environmental changes so that the no need for environment-specific configurations. This module will handle the following use-cases.

* *Creating new windows*
* *Keep a track of opened windows*
* *Keep a track of recently closed windows*
* *Tab - Window association*
* *Open window using both URL and static file path*
* *Maintaining parent-child relation*

#### Methods

* **init (main)**

Init method is only available on the main process. The `window-manager` will take the same set of configurations in both main and renderer processes. 

> **Note:** *`window-manager` uses the node environment variable(process.env.NODE_ENV) to determine the development environment. Make sure that the `process.env.NODE_ENV` is set properly in all the processes. Also, you can set the `isDev` flag using the `electron-manager` configuration.*

| Params | Type   | Default Value | Description                          |
|--------|--------|---------------|--------------------------------------|
| config | object | {}            | WindowManager initial congigurations |

* `config`

| Params        | Type   | Default Value                    | Description                                        |
|---------------|--------|----------------------------------|----------------------------------------------------|
| windowUrlPath | string | `process.env.ELECTRON_START_URL` | HTML file path for static pages(served from local) |

You can either set the environment variable `process.env.ELECTRON_START_URL` or set it on windowManager init method `windowUrlPath`.

* **createWindow (main + renderer)**

This method an alternative for `new BrowserWindow({})`, the default way of creating a window on the Electron world. `createWindow` returns the newly created window instance back.

| Params | Type   | Default Value | Description           |
|--------|--------|---------------|-----------------------|
| config | object | {}            | Window configurations |

* `config`

| Params   | Type    | Default Value       | Description                                                            |
|----------|---------|---------------------|------------------------------------------------------------------------|
| devTools | boolean | true/false          | The default value will be true in dev mode, false in production        |
| name     | string  | `window_{windowId}` | Name of the window                                                     |
| options  | object  | {}                  | BrowserWindow options as per the Electron documentation(BrowserWindow) |
| url      | string  | undefined           | The URL that has to be loaded in the newly created window              |


> **Note:** *Either `name` or `url` is mandatory to load the webContent in the newly created window. If the new window is using a hosted URL to load the content then pass the URL in `url` param. If it is a static file then, make sure that the window name is matching with the HTML file specified in the `windowUrlPath`.*


* **getWindowByName (main + renderer)**

Get the `BroserWindow` instance by its name. If there are multiple windows with the same name then, it will return the first instance from the window list.

| Params        | Type   | Default Value | Description        |
|---------------|--------|-------------- |--------------------|
| windowName(*) | string | undefined     | Name of the window |


* **getWindowsByName (main + renderer)**

Returns a list of `BroserWindow` instances by the given window name. Returns an empty array if there is no matching window instance.

| Params        | Type   | Default Value | Description        |
|---------------|--------|---------------|--------------------|
| windowName(*) | string | undefined     | Name of the window |


* **getAllWindowIds (main + renderer)**

Returns a list of window ids of the all opened windows.


* **getAllWindowNames (main + renderer)**

Returns a list of window names of the all opened windows.


* **getWindowIdByName (main + renderer)**

Returns the `BroserWindow` id.

| Params        | Type   | Default Value | Description        |
|---------------|--------|---------------|--------------------|
| windowName(*) | string | undefined     | Name of the window |

* getWindowIdsByName (main + renderer)

Returns a list of `BroserWindow` ids matching the name.

| Params        | Type   | Default Value | Description        |
|---------------|--------|---------------|--------------------|
| windowName(*) | string | undefined     | Name of the window |


## License

Licensed under MIT

Copyright (c) 2010-2020 | © HashedIn Technologies Pvt. Ltd.
