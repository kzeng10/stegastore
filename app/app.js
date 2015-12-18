import {default as React, Component} from 'react';
import {default as ReactDOM} from 'react-dom';
import {default as update} from 'react-addons-update';
import {default as Dropzone} from 'react-dropzone';
import {default as request} from 'superagent';

require('babel-polyfill');

class DropzoneArea extends Component {

  constructor(props) {
    super(props);
    this.state = {
      files: []
    };
  }

  onDrop(files, callback){
    var req = request.post('/api/upload');
    // var {files} = this.state;
    files.forEach( (file) => {
      console.log(file);
      req.attach(file.name, file, file.name);
    });
    req.end();
    this.setState({files: files.map((file) => {return file.name;})});
  }

  render() {
    return (
      <div>
        <Dropzone onDrop={this.onDrop.bind(this)}>
          <div>Try dropping some files here, or click to select files to upload.</div>
        </Dropzone>
        <FileList files={this.state.files} />
      </div>
    );
  }
}

class FileList extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <div>
        <h2>Uploaded files:</h2>
        <ul>
          {this.props.files.map((file) => {return <li id={file}>{file}</li>;})}
        </ul>
      </div>
    );
  }
}

ReactDOM.render(
  <DropzoneArea/>,
  document.getElementById('example')
);
