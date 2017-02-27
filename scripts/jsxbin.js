const { promisifyAll } = require('bluebird')
const os = require('os')
const fs = promisifyAll(require('fs'))
const { execAsync } = promisifyAll(require('child_process'))

module.exports = function jsxbinify(inputPath, outputPath, {estkPath="/Applications/Adobe ExtendScript Toolkit CC/ExtendScript Toolkit.app/Contents/MacOS/ExtendScript Toolkit"}={}) {
  assert(inputPath && inputPath != '', `Must provide jsxPath`)
  inputPath = path.resolve(__dirname, inputPath)

  if (!outputPath) {
    const inputPathParsed = path.parse(inputPath)
    outputPath = `${inputPathParsed.dir}/${inputPathParsed.name}.jsxbin`
  }
  outputPath = path.resolve(__dirname, outputPath)

  console.log(inputPath, outputPath)
  
  const compileScriptPath = `${os.tmpdir()}/compile.jsx`
  console.log(compileScriptPath)
  const compileScriptContents =
`#target estoolkit#dbg
var fileIn = File("${inputPath}");
fileIn.open("r");
var s = fileIn.read();
fileIn.close();
var t = app.compile(s);
var fileOut = File("${outputPath}");
fileOut.open("w");
fileOut.write(t);
`

  return fs.writeFileAsync(compileScriptPath, compileScriptContents)
    .then(err => {
      return execAsync(`'${estkPath}' -cmd '${compileScriptPath}'`)
    })
    // .then(function() {
    //   return fs.readFileAsync(jsxBinPath)
    // })
    // .then(function(contents) {
    //   return new Buffer(contents)
    // })
}
