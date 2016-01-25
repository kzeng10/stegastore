# StegaStore
Use Flickr's free 1-terabyte storage for storing files of any kind!

# Install & Use
### Install deps
```
$ git clone git@github.com:kzeng10/stegastore.git
$ cd stegastore
$ npm install
```
### Create a secret.js file
```javascript
var secret = {
  api_key: "my_api_key",
  secret: "my_api_secret" 
};
module.exports = secret;
```
### Run the server 
```
$ npm start
```
#### Visit at localhost:3000

Work in progress. Main functions in `main.js`.

# To-do
- [x] upload workflow (everything in raw_files -> upload)
- [x] download either individual file or photoset, sort out logic for that
- [x] instead of putting in photosets, why not just title pictures their directory?, e.g. "/foo/bar/document.pdf.png"
    - [x] ignore hidden files
    - [ ] ignore hidden folders
    - [ ] option to ignore hidden files/folders
- [ ] web app
  - [x] basic server
    - [ ] authenticate flickr account on socket connect
  - [x] basic UI/front-end (react+bootstrap)
    - [ ] drag and drop for upload
    - progress bar for each file
        - [ ] upload
        - [ ] download
  - interactivity/functionality
    - [x] display file hierarchy uploaded to flickr
    - [x] click to download/navigate
    - [ ] allow user to upload async. (AJAX)
        - workflow: click upload button -> user selects file/folder (or drag/drop) -> move to raw_files folder -> upload() -> clear copies of files in raw_files and upload folders
        - [ ] replace existings files (c/p from utils.js, modify for replace)
    - [x] allow user to download
        - workflow: click file -> download() -> convert to regular file and move to raw_files -> send to user -> clear file copies in raw_files and download folders
- [x] es6/babel
- distant future:
    - backend-ish
        - [ ] search bar functionality
        - [ ] PNGDrive (convert images to blobs) to bypass downloading files to server-side
        - [ ] maintain folder hierarchy when uploading folders to raw_files (figure out how to send webkitRelativePath in form data...)
            - react doesn't (currently) support webkitdirectory as a DOM property
        - [ ] handle incomplete file uploads (busboy?)
        - [ ] shard large files, create logic to handle that
    - frontend-ish
        - [ ] scrollable table instead of sticky navbar
        - [ ] page for entering flickr api keys
        - [ ] store credentials in cookies




# Disclaimer
I am not responsible for anything that happens to your Flickr account.
