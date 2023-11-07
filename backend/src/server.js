const fs = require('fs');
const path = require('path');

const Express = require('express');
const bodyParser = require('body-parser');

const Datil = require('./DatilClient.js');
const PDFWriter = require('./pdf/PDFWriter.js');
const pdfutils = require('./pdf/pdfutils.js');
const facturaTemplate = require('./pdf/template.js');
const db = require('./dbAdmin.js');
const {
  validarBusquedaProductos,
  validarCliente,
  validarClienteUpdate,
  validarIdInParams,
  validarMedico,
  validarNombreEmpresa,
  validarPagos,
  validarProducto,
  validarProductoUpdate,
  validarVentaInsert,
  validarVentaUpdate
} = require('./sanitizationMiddleware.js');
const {
  validarIVAEnUnidades,
  validarVentaMutable
} = require('./dbValidationMiddleware.js');
const { serveApp } = require('./empresaMiddleware.js');
const CONSTRAINT_ERROR_SQLITE = 19;
const port = process.env.PORT || 8192;
//crear directorio donde almacenar facturas en pdf.
const facturaDir = pdfutils.createTemporaryDir('facturas/');

const printError = errorString => {
  //don't print errors in tests. Tests should print errors from the response
  if (process.env.NODE_ENV !== 'integration') console.error(errorString);
};

const app = Express();
app.get('/', (req, res) => {
  res.redirect('/app');
});
app.use('/', Express.static(path.join(__dirname, '../../frontend/build')));
app.use(bodyParser.json()); // for parsing application/json

app.get('/app*', serveApp);

app.post('/cliente/new', validarCliente, (req, res) => {
  db.insertarCliente(req.safeData).then(
    rowid => {
      //OK!
      res.status(200).send({ rowid });
    },
    err => {
      //ERROR!
      printError('db error: ' + err);
      res.status(422).send(err);
    }
  );
});

function esNumero(valor) {
  return !isNaN(parseFloat(valor)) && isFinite(valor);
}

app.get('/cliente/find', (req, res) => {
   // Verificar si el queryString es un número
   var q = null;
   if (esNumero(req.query.q)) {
    // Si es un número, puedes cargar una variable de número
     q = parseInt(req.query.q);

  } else {
    // Si no es un número, puedes cargar una variable de cadena
    //const cadena = queryString;
    q = req.query.q || '';
   
  }

  //const q = req.query.q || '';
  db.findClientes(q).then(
    function(clientes) {
      if (clientes.length === 0)
        res
          .status(404)
          .send('No existen clientes con esa cadena de caracteres');
      else res.status(200).send(clientes);
    },
    function(err) {
      //ERROR!
      res.status(500).send(err);
    }
  );
});

app.post('/cliente/update', validarClienteUpdate, (req, res) => {
  const handleSuccess = function(updateCount) {
    if (updateCount === 0) res.status(404).send('Cliente no encontrado');
    else res.status(200).send('Cliente actualizado');
  };

  const handleFailiure = function(err) {
    if (err.errno === CONSTRAINT_ERROR_SQLITE)
      res
        .status(400)
        .send('Error: El identificador del cliente debe ser único.');

    console.log(err);
    res.status(500).send(err);
  };

  db.updateCliente(req.safeData).then(handleSuccess, handleFailiure);
});

app.post('/cliente/delete/:tipo/:id', (req, res) => {
  const { params } = req;
  const tipo = params.tipo || '';
  const id = params.id || '';

  const handleSuccess = function(deleteCount) {
    if (deleteCount === 0) res.status(404).send('Cliente no encontrado');
    else res.status(200).send('Cliente eliminado');
  };

  const handleFailiure = function(err) {
    if (err.errno === CONSTRAINT_ERROR_SQLITE)
      res
        .status(400)
        .send('Error: Borrar este cliente dañaría una factura existente.');
    else res.status(422).send(err);
  };

  db.deleteCliente(tipo, id).then(handleSuccess, handleFailiure);
});

app.post('/medico/new', validarMedico, (req, res) => {
  db.insertarMedico(req.safeData).then(
    () => {
      //OK!
      res.status(200).send('OK');
    },
    err => {
      //ERROR!
      printError('db error: ' + err);
      res.status(422).send(err);
    }
  );
});

app.get('/medico/find', (req, res) => {
  const q = req.query.q || '';
  db.findMedicos(q).then(
    function(medicos) {
      if (medicos.length === 0)
        res
          .status(404)
          .send('No existen clientes con esa cadena de caracteres');
      else res.status(200).send(medicos);
    },
    function(err) {
      //ERROR!
      res.status(500).send(err);
    }
  );
});

app.post('/producto/new', validarProducto, (req, res) => {
  db.insertarProducto(req.safeData).then(
    id => {
      res.status(200).send(id);
    },
    err => {
      //ERROR!
      printError('db error: ' + JSON.stringify(err));
      res.status(422).send(err);
    }
  );
});

app.get('/producto/find', validarBusquedaProductos, (req, res) => {
  db.findProductos(req.safeData).then(
    productos => {
      if (productos.length === 0)
        res
          .status(404)
          .send('No existen productos con esa cadena de caracteres');
      else res.status(200).send(productos);
    },
    err => {
      //ERROR!
      res.status(500).send(err);
    }
  );
});

app.post('/producto/update', validarProductoUpdate, (req, res) => {
  const handleSuccess = updateCount => {
    if (updateCount === 0) res.status(404).send('Producto no encontrado');
    else res.status(200).send('Producto actualizado');
  };

  const handleFailiure = err => {
    res.status(500).send(err);
  };

  db.updateProducto(req.safeData).then(handleSuccess, handleFailiure);
});

app.post('/producto/delete/:id', (req, res) => {
  const id = req.params.id;

  const handleSuccess = function(deleteCount) {
    if (deleteCount === 0) res.status(404).send('Producto no encontrado');
    else res.status(200).send('Producto eliminado');
  };

  const handleFailiure = function(err) {
    if (err.errno === CONSTRAINT_ERROR_SQLITE)
      res
        .status(400)
        .send('Error: Borrar este producto dañaría una factura existente.');
    else res.status(422).send(err);
  };

  db.deleteProducto(id).then(handleSuccess, handleFailiure);
});

const verVentaJSON = (req, res) => {
  const { id } = req.params;
  
  const okHandler = body => {
    res.status(200).send(body);
  };
  const errorHandler = error => {
    res.status(error.errorCode).send(error.text);
  };

  db.getVentaById(id).then(okHandler, errorHandler);
};

const verVentaPDF = (req, res) => {
  const { id } = req.params;
  const facturaFileName = id + '.pdf';

  db.getVentaById(id)
    .then(resp => {
      const writeFunc = facturaTemplate(resp);
      return new PDFWriter(facturaDir + facturaFileName, writeFunc);
    })
    .then(() => {
      fs.readFile(facturaDir + facturaFileName, function(err, data) {
        if (err) {
          res.status(500).send(err);
          return;
        }
        res.contentType('application/pdf');
        res.send(data);
      });
    })
    .catch(error => {
      if (error.errorCode) res.status(error.errorCode).send(error.text);
      else res.status(500).send(error);
    });
};

app.get('/venta/ver/:id', (req, res) => {
  /* if (req.headers.accept === 'application/json') verVentaJSON(req, res);
  else */ 
  verVentaPDF(req, res);
});

app.post('/venta/delete/:rowid', validarVentaMutable('params'), (req, res) => {
  const { rowid } = req.params;
  db.deleteVenta(rowid).then(
    function(deletions) {
      if (deletions === 0)
        res.status(404).send(`Factura con id: ${rowid} no encontrada`);
      else res.status(200).send('OK');
    },
    function(err) {
      //ERROR!
      res.status(500).send(err);
    }
  );
});

app.get('/venta/find', (req, res) => {
  const cliente = req.query.cliente || '';
  const empresa = req.query.empresa || '';

  db.findAllVentas(empresa, cliente).then(
    ventas => {
      if (ventas.length === 0)
        res
          .status(404)
          .send('No existen facturas con esa cadena de caracteres');
      else res.status(200).send(ventas);
    },
    err => {
      //ERROR!
      console.error(err);
      res.status(500).send(err);
    }
  );
});

const handleValidData = fn => async (req, res) => {
  try {
    const { status, resp } = await fn(req.safeData);
    res.status(status).send(resp);
  } catch (err) {
    console.error('Error al procesar request:', err);
    res.status(500).send(err);
  }
};

const generarNuevoComprobante = async ventaId => {
  const venta = await db.getVentaById(ventaId);
  //const { id, clave_acceso, datilMsg } = await Datil.emitirFactura(venta);

  //if (datilMsg) return { status: 520, resp: { rowid: ventaId, datilMsg } };
  clave_acceso= 0
  id= ventaId

  await db.colocarComprobante({ ventaId, id, clave_acceso });

  return { status: 200, resp: { rowid: ventaId, id } };
};

app.post(
  '/venta/emitir/:id',
  validarIdInParams,
  handleValidData(data => generarNuevoComprobante(data.id))
);

app.post(
  '/venta/new',
  validarVentaInsert,
  validarPagos,
  validarIVAEnUnidades,
  validarNombreEmpresa,
  handleValidData(async data => {
    const insertFn = data.tipo ? db.insertarVentaExamen : db.insertarVenta;
    const ventaId = await insertFn(data);
    return { status: 200, resp: { rowid: ventaId } };
  })
);

app.post(
  '/venta/update',
  validarVentaUpdate,
  validarPagos,
  validarIVAEnUnidades,
  validarNombreEmpresa,
  validarVentaMutable('safeData'),
  handleValidData(async data => {
    const updateFn = data.tipo ? db.updateVentaExamen : db.updateVenta;
    await updateFn(data);
    return { status: 200, resp: { rowid: data.rowid } };
  })
);

const server = app.listen(port, function() {
  //eslint-disable-next-line
  console.log('Application listening on  port ' + port);
});

module.exports = {
  destroy: () => {
    server.close();
    db.close();
  }
};
