const PDFDocument = require('pdfkit');
const fs = require('fs');

class PDFWriter {
  constructor(filepath, writeFunc, largo) {
    this.filepath = filepath;
    this.writeFunc = writeFunc;
    // Dimensiones en milímetros
    const anchoMm = 58;
    //const largoMmm = this.writeFunc;
    const largoMm = largo;


    // Conversión a pulgadas
    const anchoPulgadas = anchoMm / 25.4;
    const largoPulgadas = largoMm / 25.4;
    const doc = new PDFDocument({
      
      size: [anchoPulgadas * 72, largoPulgadas * 72],
      margins: {
        top: 5,
        left: 2,
        bottom: 2,
        right: 2
      }
    }); 


    this.doc = doc;
    
  }

  then(res, rej) {
    const { filepath, doc } = this;
    this.writeFunc(doc);
    return new Promise(function(resolve, reject) {
      const stream = fs.createWriteStream(filepath);
      doc.on('error', reject);
      doc.on('end', resolve);
      doc.pipe(stream);
      doc.end();
    }).then(res, rej);
  }
}

module.exports = PDFWriter;
