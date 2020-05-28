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
 
* **ElectronUpdater**
* **Logger**
* **StorageManager**
* **WindowManager**
 
### ElectronUpdater
 
ElectronUpdater module is used to update the application from existing version to newer versions. It can be used in both the main process as well as the renderer process. The electronUpdater is a lightweight module in `electron-manager` which helps to update the application in production mode.
 
> **Note:** Please use electron-builder for the build configuration. Code-signing is required for ElectronUpdater to build the application else we need to disable the appropriate flags stated by the electron-builder.
 
* **Example for basic configuration required for generic providers**
 
```js
 "publish": {
   "provider": "generic",
   "url": "please add the published url"
 }
 ...
 //disable the Code-signing using the below flags
 win {
   "verifyUpdateCodeSignature": false
 },
 mac{
   "identity": null
 }
```
 
#### Methods
 
* **init (main)**
The ElectronUpdater module has to be initialized in the main processes.
 
```js
import electronManager from 'electron-manager';
 
const { electronUpdater } = electronManager;
...
electronUpdater.init();
```
 
* **autoUpdate (main + renderer)**
`autoUpdate` method downloads and installs the available updates.
 
```js
electronUpdater.autoUpdate()
```
 
* **checkForUpdates (main + renderer)**
`checkForUpdates` method checks if any new updates are available and returns a promise. If any update is available checkForUpdates resolves the promise, then we can make our own callbacks like showing windows or dialogue.
 
```js
electronUpdater.checkForUpdates()
.then(() => {
 // your own callback if update available
});
```
* **downloadUpdates (main + renderer)**
`downloadUpdate` method downloads the updated application and returns a Promise with the downloaded location of the new version. Custom logic can also be added as required to run/show after download and before installing it.
 
```js
electronUpdater.downloadUpdates()
.then((path) => {
 console.log(path); // Prints location of the new version downloaded;
 // Custom logic can be added here.
 ...
 electronUpdater.installUpdates();
});
```
> **Note:** This method just downloads the updated version but won't install it. Please use the `installUpdates` method to install the application. If we don't install after the update it will ask to install the application after closing the current running application.
 
* **installUpdates (main + renderer)**
`installUpdates` method installs the updated version. It quits the application and installs the new version.
 
```js
electronUpdater.installUpdates();
```
 
* **cancelUpdate (main + renderer)**
`cancelUpdate` method cancels the downloading of the application.
 
```js
electronUpdater.cancelUpdate();
```
 
### Logger
 
Logger module helps to log all kinds of entries to both console and file. It can be used in both the main process as well as the renderer process. The logger is a lightweight module in `electron-manager` which helps to debug the application in development as well as in production.
 
> **Note:** It is possible to have a different set of configurations for both main and renderer. In case there are multiple renderer processes in the application, then the logger module also has to be initialized in each module wherever required. Also, there can be different sets of configurations for each renderer process. If there is no custom configuration for renderer processes, then the main process configuration would be extended to all renderer processes.
 
#### Methods
 
* **init (main + renderer)**
 
The logger module has to be initialized in respective processes with a relevant set of configuration options. Since there can be multiple renderer processes in an electron application, the logger module also can be set up for all the processes based on user preferences.
 
|     Params    | Type    | Default Value   | Description                                                     |
|---------------|---------|-----------------|-----------------------------------------------------------------|
| cleanLogs     | boolean | true            | Clean log files periodically                                    |
| logFolderPath | string  | `userData/logs` | Application logs folder path                                    |
| logPeriod     | number  | 30              | Logfile's lifespan in days                                      |
| proxifyConsol | boolean | false           | Override all console statements with proper logger statements.  |
| setFileHeader | boolean | true            | Add file header in each log file                                |
| writeToFile   | boolean | true            | Write log entries into a system file                            |
 
> **Note:** *`userData` The directory for storing your app's configuration files, which by default it is the appData directory appended with your app's name.*
 
```js
import electronManager from 'electron-manager';
 
const { logger } = electronManager;
 
...
logger.init({
 proxifyConsol: true,
 logPeriod: 7
});
```
 
* **error (main + renderer)**
 
`error` method is a proxy of `console.error`. If `proxifyConsol: true`, then all `console.error` statements would be proxied to `logger.error`. Also, all the logger statement properties will be applicable to the console statement as well. This would be similar for below methods as well.
 
```js
logger.error('This is an error message!');
 
// If `proxifyConsol: true`, then you can also use the console statements
console.error('This is an error message!');
```
 
* **info (main + renderer)**
 
`info` method is a proxy of `console.info`.
 
```js
logger.info('This is an info message!');
```
 
* **log (main + renderer)**
 
`log` method is a proxy of `console.log`.
 
```js
logger.log('This is a log message!');
```
 
* **warn (main + renderer)**
 
`warn` method is a proxy of `console.warn`.
 
```js
logger.warn('This is a warning message!');
```
 
### StorageManager
 
The `StorageManager` is used to store the application data into the disk storage. The default storage location would be the `AppData` folder of the installed application.
 
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
 
> **Note:** *You can create storage files in custom locations by setting location property in the individual configurations.*
 
 
* **createStorage (main + render)**
 
| Params | Type   | Default Value | Description           |
|--------|--------|---------------|-----------------------|
| config | object | {}            | Storage configuration |
 
The configuration can be of type array or object. If you have multiple storages then pass the configuration as an array of objects. For single storage, it will take an object as a valid parameter.
 
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
 
WindowManager can be used for creating and managing windows in an Electron application. WindowManager internally handles the environmental changes so that environment-specific configurations are not required. This module will handle the following use-cases:
 
* *Creating new windows*
* *Keep a track of opened windows*
* *Keep a track of recently closed windows*
* *Tab - Window association*
* *Open window using both URL and static file path*
* *Maintaining parent-child relation*
 
#### Methods
 
* **init (main)**
 
Init method is only available on the main process. The `window-manager` will take the same set of configurations in both main and renderer processes. 
 
> **Note:** *`window-manager` uses the node environment variable(process.env.NODE_ENV) to determine the development environment. Make sure that the `process.env.NODE_ENV` is set properly in all the processes. Also, you can set the `isDev` flag using the `electron-manager` configuration.*
 
| Params | Type   | Default Value | Description                          |
|--------|--------|---------------|--------------------------------------|
| config | object | {}            | WindowManager initial congigurations |
 
* `config`
 
| Params         | Type    | Default Value                    | Description                                             |
|----------------|---------|----------------------------------|---------------------------------------------------------|
| enableDevTools | boolean | false                            | Enable devTools for both `development` and `production` |
| windowUrlPath  | string  | `process.env.ELECTRON_START_URL` | HTML file path for static pages(served from local)      |
 
DevTools will be disabled in production by default. You can enable it by setting `enableDevTools`. This flag will only enable the devTool option in windowManager. For opening the devTools, proper options in createWindow configurations are required to be passed.
 
You can either set the environment variable `process.env.ELECTRON_START_URL` or set it on windowManager init method `windowUrlPath`.
 
* **createWindow (main + renderer)**
 
This method is an alternative for `new BrowserWindow({})`, the default way of creating a window on the Electron world. `createWindow` returns the newly created window instance back.
 
| Params | Type   | Default Value | Description           |
|--------|--------|---------------|-----------------------|
| config | object | {}            | Window configurations |
 
* `config`
 
| Params   | Type    | Default Value       | Description                                                            |
|----------|---------|---------------------|------------------------------------------------------------------------|
| devTools | boolean | true/false          | The default value will be true in dev mode, false in production        |
| name     | string  | `window_{windowId}` | Name of the window                                                     |
| options  | object  | {}                  | BrowserWindow options as per the Electron documentation(BrowserWindow) |
| url      | string  | undefined           | The URL that has to be loaded in the newly created window              |
 
 
> **Note:** *Either `name` or `url` is mandatory to load the webContent in the newly created window. If the new window is using a hosted URL to load the content then pass the URL in `url` param. If it is a static file then, make sure that the window name is matching with the HTML file specified in the `windowUrlPath`.*
 
 
* **getWindowByName (main + renderer)**
 
Get the `BroserWindow` instance by its name. If there are multiple windows with the same name, it will return the first instance from the window list.
 
| Params        | Type   | Default Value | Description        |
|---------------|--------|-------------- |--------------------|
| windowName(*) | string | undefined     | Name of the window |
 
 
* **getWindowsByName (main + renderer)**
 
Returns a list of `BroserWindow` instances by the given window name. Returns an empty array if there are no matching window instances.
 
| Params        | Type   | Default Value | Description        |
|---------------|--------|---------------|--------------------|
| windowName(*) | string | undefined     | Name of the window |
 
 
* **getAllWindowIds (main + renderer)**
 
Returns a list of window ids of all opened windows.
 
 
* **getAllWindowNames (main + renderer)**
 
Returns a list of window names of all opened windows.
 
 
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
 