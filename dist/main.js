function encode(event) {
  event.preventDefault();
  event.stopPropagation();

  var pngdrive = new PNGDrive();
  console.log(event);
  var files = event.dataTransfer.files;

  for (var i = 0, file; file = files[i]; i++) {
    pngdrive.addFile(file);
  }

  pngdrive.encode(() => {
    var image = this.createImage();
    console.log(image);
  });
}
