const {
  generarDetalleOpcionesDePago,
  crearMatrizValoresTotales,
  valorPalabras
} = require('../pdf/pdfutils.js');
const { calcularValoresTotales } = require('facturacion_common/src/Math.js');
const Money = require('facturacion_common/src/Money.js');

const MAIN_BOX_X = 27;
const MAIN_BOX_WIDTH = 519;

const BOX2_POS = { x: MAIN_BOX_X, y: 248 };
const BOX2_SIZE = { x: MAIN_BOX_WIDTH, y: 482 };

const BOX2_END_X = BOX2_POS.x + BOX2_SIZE.x;

const X2_LINE = -2;
const Y4_LINE = 590;
const unitPriceColumnSeparator = 50;

const drawInvoiceInfoContents = (doc, { ventaRow, clienteRow, comprobanteRow}) => {
  const { nombre, apellido, telefono1, direccion, id } = clienteRow;
  const { fecha } = ventaRow;
  const { secuencial } = comprobanteRow;
  let fechaFormato = new Date(fecha);



let dia = agregarCero(fechaFormato.getUTCDate());
let mes = agregarCero(fechaFormato.getUTCMonth() + 1); // Meses son 0 indexados
let año = fechaFormato.getUTCFullYear();
let hora = agregarCero(fechaFormato.getUTCHours());
let minuto = agregarCero(fechaFormato.getUTCMinutes());
// Ejemplo de uso:
const comprobante = leftPad(secuencial, 6, '0');

const apellidoValidado = apellido === null ? '' : apellido;


    // Formateamos la fecha según tus necesidades
  let fechaFormateada = `${dia}/${mes}/${año} ${hora}:${minuto}`;
  doc.x = 14;
  doc.y = 20;
  doc.fontSize(8);
  doc.lineGap(2);
  doc
  .text('Asociación de Pensionados y Jubilados')
  .text('    del Instituto de Previsión Social')
  .text('                    I.P.S. - Ypacaraí')
  .text('---------------------------------------------------')
  doc.lineGap(4);
  doc
  .text('Timbrado: 17252383' )
  .text('Inicio de vigencia: 30/05/2024')
  .text('RUC: 80076860-4' )
  .text('Factura Virtual: 001-002-'+comprobante)
  .text('Fecha de emision: '+ fechaFormateada)
  .text('Nombre: ' + nombre +' ' + apellidoValidado)
  .text('RUC: '+ id)  
  //.text('Dirección: ' +direccion)
  //.text('Teléfono: '+telefono1)
  .text('---------------------------------------------------');

};

function agregarCero(numero) {
  return numero < 10 ? '0' + numero : numero;
}
function leftPad(str, len, ch) {
  const padChar = ch !== undefined ? ch.toString() : ' ';
  const strValue = str.toString();

  if (strValue.length >= len) {
      return strValue;
  } else {
      const padding = Array(len - strValue.length + 1).join(padChar);
      return padding + strValue;
  }
}






const drawFacturableLine = (doc, facturable, detallado, pos) => {
  

  const precioVentaStr = Money.print(facturable.precioVenta);


  const precioTotal = Money.print(facturable.count * facturable.precioVenta);

  doc.fontSize(7);
  doc.text('  '+facturable.count +'          '+facturable.codigo +  '      '+ precioVentaStr +'         '+precioTotal);


  

  //drawFacturableDescription(doc, facturable, detallado, linePos);
};
const drawFacturablesDetails = (doc, unidades, detallado) => {
  try {
    doc.lineGap(4);
    doc.fontSize(8);
    doc.text('Cant     Concepto     Unitario     Total');


    unidades.forEach((facturable, i) => {
      const heightFactor = detallado ? 4 : 2;
      const facturableSeDesborda =
        doc.y + doc.currentLineHeight() * heightFactor > Y4_LINE;
      if (facturableSeDesborda) throw { indiceDeDesborde: i };
      drawFacturableLine(doc, facturable, detallado, i + 1);
    });
  } catch (err) {
    if (err.indiceDeDesborde) return err.indiceDeDesborde;
    throw err;
  } finally {
    doc.fontSize(12);
  }
};

const drawValueLine = (doc, valueLabel, valueSymbol, valueNumber) => {
  const labelColumnX = X2_LINE + 8;
  const symbolColumnWidth = unitPriceColumnSeparator - X2_LINE;
  const valueColumnWidth = BOX2_END_X - unitPriceColumnSeparator - 10;
  const valueColumnX = unitPriceColumnSeparator + 5;
  const linePos = doc.y;

  doc.text(valueLabel, labelColumnX+30, linePos);
  doc.text(valueSymbol, X2_LINE+50, linePos, {
    align: 'right',
    width: symbolColumnWidth
  });
  if (valueNumber !== '')
    doc.text(valueNumber, -352, linePos, {
      align: 'right',
      width: valueColumnWidth
      
    }); 
    
};

const drawTotalValues = (doc, ventaRow) => {
  doc.lineGap(4);
  // eslint-disable-next-line fp/no-mutation
 // doc.y = Y4_LINE + 15;
  doc.fontSize(7);
  doc.text('-----------------------------------------------------------');
  const matrizValoresTotales = crearMatrizValoresTotales(ventaRow);
  matrizValoresTotales.forEach(args => {
    drawValueLine(doc, ...args);
  });
  doc.lineGap(0); //restore default
};



const drawTotal = (doc, total) => {
  doc
    .fontSize(7)
    .text(total)
};


const drawLineFooter = (doc) => {
  const startX = 10;
  doc.fontSize(7);
  doc.x = startX;
  doc.y = doc.y;
  doc.text('-----------------------------------------------------------');
  doc.text('ORIGINAL SOCIO', 38,doc.y+3);

  doc.fontSize(12); //restore default
};


module.exports = ({ ventaRow, unidades, pagos, clienteRow, comprobanteRow }) => {
  const writeFunc = doc => {
    const { detallado } = ventaRow;
    const { total } = calcularValoresTotales(
      ventaRow.subtotal,
      0,
    );

    drawInvoiceInfoContents(doc, { ventaRow, clienteRow, unidades, comprobanteRow });
    const remainingFacturablesIndex = drawFacturablesDetails(
      doc,
      unidades,
      detallado
    );
    drawTotal(doc, '                                       TOTAL:       ' + total);

    drawTotalValues(doc, ventaRow);
    drawLineFooter(doc);

    
  };



// Aquí retornas la función writeFunc
return writeFunc;
};




