import {default as React, Component} from 'react';
import {default as ReactDOM} from 'react-dom';
import {default as update} from 'react-addons-update';
import {default as Dropzone} from 'react-dropzone';
import {default as request} from 'superagent';
import {Breadcrumb, BreadcrumbItem, Table} from 'react-bootstrap';

require('babel-polyfill');

class StegaView extends Component {

  render() {
    return(
      <Directory />

    );
  }

}

class Directory extends Component {
  //Clicking on home should go back to home
  constructor(props) {
    super(props);
  }

  render() {
    console.log(Breadcrumb);
    return (
      <div>
        <Breadcrumb>
          <BreadcrumbItem href='#'>
            Home
          </BreadcrumbItem>
          <BreadcrumbItem active>
            Folder
          </BreadcrumbItem>
        </Breadcrumb>
      </div>
    );
  }
}

class DropzoneArea extends Component {

  constructor(props) {
    super(props);
    this.state = {
      files: [],
      percent: 0
    };
  }

  onDragEnter(event) {
    console.log(event);
  }

  onDrop(files, callback){
    if(files.some((file) => {return file.size > 195*1024*1024;})) {
      //alert the user that one of their files exceeds capacity
      console.log(`At least one of your files exceeds file size maximum`);
      return;
    }
    var req = request.post('/api/upload').on('progress', (e) => {
      console.log(`${e.percent} uploaded`);
      this.setState({percent: parseInt(e.percent)});
    });
    files.forEach( (file) => {
      console.log(file);
      req.attach(file.name, file, file.name);
    });
    req.end( (res) => {
      console.log(res);
      // if(res.ok) {
      //   console.log('Success in uploading files', res);
      // } else {
      //   console.log('Error', res);
      }
    )
    this.setState({files: this.state.files.concat(files.map((file) => {return file.name;}))});
  }

  render() {
    return (
      <div>
        <Dropzone onDrop={this.onDrop.bind(this)} onDragEnter={this.onDragEnter}>
          <div>Try dropping some files here, or click to select files to upload.</div>
        </Dropzone>
        <FileList files={this.state.files} percent={this.state.percent}/>
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
        <h3>Progress: {this.props.percent}%</h3>
        <ul>
          {this.props.files.map((file) => {return <li id={file}>{file}</li>;})}
        </ul>
      </div>
    );
  }
}

ReactDOM.render(
  <StegaView/>,
  document.getElementById('example')
);
