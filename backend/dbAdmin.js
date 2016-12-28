const knex = require('./db.js')

const colocarVentaID = (unidades, ventaId) => {
  const len = unidades.length
  for (let i = 0; i < len; i++)
    unidades[i].venta = ventaId
}

const insertarVenta = (builder, codigo, cliente, fecha, autorizacion, formaPago,
    subtotal, descuento, iva, total) => {
  return builder.table('ventas').insert({
    codigo: codigo,
    cliente: cliente,
    fecha: fecha,
    autorizacion: autorizacion,
    formaPago: formaPago,
    subtotal: subtotal,
    descuento: descuento,
    iva: iva,
    total: total,
  })
}

const insertarNuevasUnidades = (builder, listaDeUnidades) => {
  return builder.table('unidades').insert(listaDeUnidades)
}
const getVenta = (codigo, fecha) => {
  return knex.select('*')
  .from('ventas')
  .where({codigo: codigo, fecha: fecha})
}

const getUnidadesVenta = (ventaKey) => {
  return knex.select('*')
  .from('unidades')
  .where({venta: ventaKey})
}

module.exports = {
  close: () => { knex.destroy() },
  insertarProducto: (codigo, nombre, precioDist, precioVenta) => {
    return knex.table('productos').insert({
      codigo: codigo,
      nombre: nombre,
      precioDist: precioDist,
      precioVenta: precioVenta,
    })
  },

  findProductos: (queryString) => {
    const queries = queryString.split(' ')
    const queryObject = knex.select('*')
      .from('productos')
      .where('nombre', 'like', `%${queries[0]}%`)

    for(let i = 1; i < queries.length; i++)
      queryObject.orWhere('nombre', 'like', `%${queries[i]}%`)

    return queryObject.limit(5)
  },

  insertarCliente: (ruc, nombre, direccion, email, telefono1, telefono2) => {
    return knex.table('clientes').insert({
      ruc: ruc,
      nombre: nombre,
      direccion: direccion,
      email: email,
      telefono1: telefono1,
      telefono2: telefono2,
    })
  },

  findClientes: (queryString) => {
    const queries = queryString.split(' ')
    const queryObject = knex.select('*')
      .from('clientes')
      .where('nombre', 'like', `%${queries[0]}%`)

    for(let i = 1; i < queries.length; i++)
      queryObject.orWhere('nombre', 'like', `%${queries[i]}%`)

    return queryObject.limit(5)
  },

  insertarVenta: (codigo, cliente, fecha, autorizacion, formaPago,
    subtotal, descuento, iva, total, unidades) => {
    return knex.transaction ((trx) => {
      return insertarVenta(trx, codigo, cliente, fecha, autorizacion, formaPago,
    subtotal, descuento, iva, total)
      .then((ids) => {
        const ventaId = ids[0]
        colocarVentaID(unidades, ventaId)
        return insertarNuevasUnidades(trx, unidades)
      })
    })
  },

  getFacturaData: (codigo, fecha) => {
    let ventaRow;
    return getVenta(codigo, fecha)
    .then((ventas) => {
      if (ventas.length > 0) {
        ventaRow = ventas[0]
        return getUnidadesVenta(ventaRow.rowid)
      } else {
        return Promise.reject(404)
      }
    }, (err) => {
      return Promise.reject(500)
    })
    .then ((productos) => {
      ventaRow.productos = productos
      return Promise.resolve(ventaRow)
    }, (errorCode) => {
      return Promise.reject(errorCode)
    })
  },
}
