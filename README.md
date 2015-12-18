# StegaStore
Use Flickr's free 1-terabyte storage for storing files of any kind!

# Install
```
$ git clone git@github.com:kzeng10/stegastore.git
$ npm install
```
Work in progress. Main functions in `main.js`, to be built into a full-fledged app (web?)

# To-do
- [x] upload workflow (everything in raw_files -> upload)
- [x] download either individual file or photoset, sort out logic for that
- es6/babel
- [ ] web app
  - [x] basic server
  - [ ] basic UI/front-end (react)
    - [ ]drag and drop for upload
  - interactivity
    - [ ] display file hierarchy uploaded to flickr
        - click to download/navigate
    - [x] allow user to upload async. (AJAX)
        - workflow: click upload button -> user selects file/folder -> move to raw_files folder -> upload() -> clear raw_files and upload folders
        - [ ] maintain folder hierarchy when uploading folders to raw_files (figure out how to send webkitRelativePath in form data...)
        - [ ] replace existings files (waiting for flickrapi to add that in...)
    - [ ] allow user to download
        - workflow: click file -> download() -> convert to regular file and move to raw_files -> send to user -> clear raw_files and download folders
    - [ ] allow user to upsync (native client only?)
    - [ ] allow user to downsync (native clinet only?)

# Disclaimer
I am not responsible for anything that happens to your Flickr account when you use StegaStore.
