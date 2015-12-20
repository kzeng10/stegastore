import {default as React, Component} from 'react';
import {default as ReactDOM} from 'react-dom';
import {default as update} from 'react-addons-update';
import {default as Dropzone} from 'react-dropzone';
import {default as request} from 'superagent';
import {Breadcrumb, BreadcrumbItem, Table, Glyphicon, Input, Row, Col, Grid, Navbar} from 'react-bootstrap';
import {default as FontAwesome} from 'react-fontawesome';

require('babel-polyfill');

class StegaView extends Component {

  constructor(props) {
    super(props);
    this.state = {
      // populate directory with event from socket.io
      directory: {}, //{photoset: {photoname: id}}

    }
  }

  componentWillMount() {
    this.socket = io();
    this.socket.on('directory', (directory) => {
      this.setState({directory});
    });

    // this.socket.on('hello', () => {
    //   this.socket.emit('hello');
    //   console.log('hello');
    // });
    // this.socket.emit('hello');
    // keep in mind that this doesn't work. Only server-side receives the "connection" event.
    // this.socket.on('connection', () => {
    //   this.socket.emit('hello');
    //   console.log('hello');
    // });
  }

  render() {
    return(
      <div>
        <NavMain />
        <Grid>
          <Row>
            <DirectoryBreadCrumb />
            <DirectorySearchBar />
          </Row>
          <DirectoryTable {...this.state} />
        </Grid>
      </div>
    );
  }
}

class NavMain extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return(
        <Navbar fixedTop>
          <Navbar.Header>
            <Navbar.Brand>StegaStore</Navbar.Brand>
          </Navbar.Header>
        </Navbar>
    );
  }
}

class DirectoryTable extends Component {
  //Clicking on file should download
  constructor(props) {
    super(props);
  }

  render() {
    var rows = Object.keys(this.props.directory).map((photoset) => {
      if(photoset === 'root') {
        var rootfiles = Object.keys(this.props.directory.root).map((rootfile) => {
          var glyph = <Glyphicon glyph='file' />;
          switch(rootfile.split('.').slice(-1)[0]) {
            case 'jpg':
            case 'png':
            case 'jpeg':
            case 'gif':
              glyph = <Glyphicon glyph='picture' />;
              break;
            case 'pdf':
              glyph = <FontAwesome className='fa fa-file-pdf-o' name='rootfile'/>;
              break;
            //add more cases here...
          }
          return (
            <tr>
              <td>{glyph}</td>
              <td>{rootfile}</td>
              <td>Today</td>
            </tr>
          );
        });
        return rootfiles;
      } else {
        return (
          <tr>
            <td><Glyphicon glyph="folder-close" /></td>
            <td>{photoset}</td>
            <td>Today</td>
          </tr>
        );
      }
    });

    return(
      <Table responsive hover>
        <thead>
          <tr>
            <th><Glyphicon glyph="star" /></th>
            <th>Name</th>
            <th>Modified</th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </Table>
    );
  }
}

class DirectoryBreadCrumb extends Component {
  //Clicking on home should go back to home
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Col xs={6} sm={8} md={9}>
        <Breadcrumb>
          <BreadcrumbItem href='#'>
            Home
          </BreadcrumbItem>
          <BreadcrumbItem active>
            Folder
          </BreadcrumbItem>
        </Breadcrumb>
      </Col>
    );
  }
}

class DirectorySearchBar extends Component {
  //Search through directory react-ively
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <Col xs={6} sm={4} md={3}>
        <Input
          type="text"
          placeholder="Search"
          addonAfter={<Glyphicon glyph="search" />}
        />
      </Col>
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
