# StegaStore
Use Flickr's free 1-terabyte storage for storing files of any kind!

# Install & Use
```
$ git clone git@github.com:kzeng10/stegastore.git
$ npm install
$ npm start
```
Work in progress. Main functions in `main.js`.

# To-do
- [x] upload workflow (everything in raw_files -> upload)
- [x] download either individual file or photoset, sort out logic for that
- [ ] web app
  - [x] basic server
  - [x] basic UI/front-end (react+bootstrap)
    - [ ] drag and drop for upload
    - [ ] progress bar for uploads
  - authentication
    - [ ] authenticate flickr account on socket connect
    - [ ] store credentials in cookies
  - interactivity
    - [x] display file hierarchy uploaded to flickr
    - [ ] click to download/navigate
    - [ ] allow user to upload async. (AJAX)
        - workflow: click upload button -> user selects file/folder -> move to raw_files folder -> upload() -> clear raw_files and upload folders
        - [ ] replace existings files (c/p from utils.js, modify for replace)
    - [ ] allow user to download
        - workflow: click file -> download() -> convert to regular file and move to raw_files -> send to user -> clear raw_files and download folders
- [x] es6/babel
- distant future:
    - [ ] search bar functionality
    - [ ] maintain folder hierarchy when uploading folders to raw_files (figure out how to send webkitRelativePath in form data...)
        - react doesn't (currently) support webkitdirectory as a DOM property
    - [ ] handle incomplete file uploads (busboy?)
    - [ ] shard large files, create logic to handle that


# Disclaimer
I am not responsible for anything that happens to your Flickr account when you use StegaStore.
