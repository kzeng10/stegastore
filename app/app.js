import {default as React, Component} from 'react';
import {default as ReactDOM} from 'react-dom';
import {default as update} from 'react-addons-update';
import {default as Dropzone} from 'react-dropzone';
import {default as request} from 'superagent';
import {Breadcrumb, BreadcrumbItem, Table, Glyphicon, Input, Row, Col, Grid, Navbar, Nav, NavDropdown, MenuItem} from 'react-bootstrap';
import {default as FontAwesome} from 'react-fontawesome';
import {default as _} from 'underscore';

require('babel-polyfill');

class StegaView extends Component {

  constructor(props) {
    super(props);
    this.state = {
      // populate directory with event from socket.io
      directory: {}, //{photoset: {photoname: id}}
      scrollY: 0
    }
  }

  componentWillMount() {
    this.socket = io();
    this.socket.on('directory', (directory) => {
      this.setState({directory});
    });
    window.addEventListener('scroll', () => {this.setState({scrollY: window.pageYOffset});});
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
        <NavMain {...this.state}/>
        <Grid>
          <Row>
          <Col xs={6} sm={8} md={9}><DirectoryBreadCrumb /></Col>
          <Col xs={6} sm={4} md={3}><DirectorySearchBar /></Col>
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
    var style = {float: 'left', margin: '7px 10px'};
    var content =
    <Navbar fluid>
      <Grid>
        <Navbar.Header>
          <Navbar.Brand>StegaStore</Navbar.Brand>
        </Navbar.Header>
        <Nav pullRight>
          <NavDropdown title="Account">
            <MenuItem>Settings</MenuItem>
            <MenuItem>Logout</MenuItem>
          </NavDropdown>
        </Nav>
      </Grid>
    </Navbar>;
    if(this.props.scrollY > 50) {
      content =
      <Navbar fixedTop fluid>
        <Grid>
          <Navbar.Collapse>
            <Navbar.Header>
              <Navbar.Brand>StegaStore</Navbar.Brand>
            </Navbar.Header>
            <Navbar.Form pullRight>
              <DirectorySearchBar />
            </Navbar.Form>
          </Navbar.Collapse>
        </Grid>
      </Navbar>;
    }
    return content;
  }
}

class DirectoryTable extends Component {
  //Clicking on file should download
  //Clicking on folder should go into folder
  constructor(props) {
    super(props);
    this.state = {
      curDir: ''
    }
  }

  changeDir(folder) {
    this.setState({
      curDir: this.state.curDir+folder+'/'
    });
    console.log(this.state.curDir);
  }

  render() {
    var rows = _.uniq(Object.keys(this.props.directory)
      .filter((file) => {return file.indexOf(this.state.curDir) === 0;}) //only current directory
      .map((file) => {return file.substring(this.state.curDir.length);}) //remove directory prefix
      .map((file) => {return file.split('/')[0];})) //for nested files, show only top-most parent folder
    .map((file) => {
      var glyph = <Glyphicon glyph='file' />;

      //check if folder
      if(this.props.directory[this.state.curDir + file] === undefined) {
        glyph = <Glyphicon glyph='folder-close' />;
        file = <a href='#' onClick={this.changeDir.bind(this,file)}>{file}</a>;

        // function updateDir(folder) {
        //   this.setState({})
        // }
      } else {
        //take off .png from the end
        file = file.split('.').slice(0,-1).join('.');

        switch(file.split('.').slice(-1)[0]) {
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
      }
      return (
        <tr>
          <td>{glyph}</td>
          <td>{file}</td>
          <td>Today</td>
        </tr>
      );
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
      <Breadcrumb>
        <BreadcrumbItem href='#'>
          Home
        </BreadcrumbItem>
        <BreadcrumbItem active>
          Folder
        </BreadcrumbItem>
      </Breadcrumb>
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
      <Input
        type="text"
        placeholder="Search"
        addonAfter={<Glyphicon glyph="search" />}
      />
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
