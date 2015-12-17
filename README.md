# StegaStore
Use Flickr's free 1-terabyte storage for storing files of any kind!
Note that Flickr's restrictions only allow for files under 200mb.

# Install
```
$ git clone git@github.com:kzeng10/stegastore.git
$ npm install
```
Work in progress. Main functions in `main.js`, to be built into a full-fledged app (web?)

# To-do
- [x] upload workflow (everything in raw_files -> upload)
- [ ] download either individual file or photoset, sort out logic for that
- [ ] web app
  - [ ] basic server
  - [ ] local database (file hierarchy, photoset mappings)
  - [ ] basic UI/front-end
  - interactivity
    - [ ] display file hierarchy uploaded to flickr
    - [ ] allow user to upload async. (AJAX)
        - workflow: click upload button -> user selects file/folder -> move to raw_files folder -> upload()
    - [ ] allow user to download
        - workflow: click file -> download() -> convert to regular file and move to raw_files
    - [ ] allow user to upsync (native client only?)
    - [ ] allow user to downsync (native clinet only?)

# Disclaimer
I am not responsible for anything that happens to your Flickr account when you use StegaStore.
