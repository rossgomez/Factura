/* eslint-env node, mocha */
/* eslint-disable no-console */

if(process.env.NODE_ENV !== 'test') {
  //Por el amor de dios solo ejecutar esto en ambiente de prueba
  console.error("QUE CHUCHA CREES QUE HACES?",
  "QUIERES BORRAR TODA LA BASE DE PRODUCCION?",
  "DEBES DE EJECUTAR ESTO CON NODE_ENV=test")
  process.exit(1)
}

const assert = require('assert');
const chai = require('chai')
  , expect = chai.expect
  , should = chai.should();

const db = require("../../backend/dbAdmin.js")

describe('metodos de dbAdmin.js', function () {

  describe('insertarProducto', function () {

    it("persiste varios productos en la base encadenando con promise", function (done) {
      db.insertarProducto("fsers4", "producto A", 9.99, 14.99)
      .then(function (ids) {
        ids.should.not.be.empty
        ids[0].should.be.a('number')
        return db.insertarProducto("gfdtt", "producto B", 19.99, 24.99)
      }).then(function (ids) {
        ids.should.not.be.empty
        ids[0].should.be.a('number')
        return db.insertarProducto("gfgtb4", "producto C", 14.99, 18.99)
      }).then(function (ids) {
        ids.should.not.be.empty
        ids[0].should.be.a('number')
        done()
      })
    })

  })

  describe('findProductos', function () {

    it('retorna un array con todos los productos existentes si se le pasa un string vacio', function (done) {
      db.findProductos('')
      .then(function(productos) {
        productos.should.be.an('array')
        productos.should.not.be.empty
        done()
      })
    })

    it('puede buscar prodctos por nombre, si se le pasa un string no vacio como argumento', function (done) {
      db.findProductos('prod')
      .then(function(productos) {
        productos.should.be.an('array')
        //Esto asume que en el describe anterior se ingresaron unicamente 3 productos
        productos.length.should.be.equal(3)
        productos[0].nombre.should.be.equal('producto A')
        productos[1].nombre.should.be.equal('producto B')
        productos[2].nombre.should.be.equal('producto C')
        done()
      })
    })

  })

  describe('insertarCliente', function() {

    it('persiste varios clientes en la base encadenando con promise', function (done) {
      db.insertarCliente("0954236576001", "Dr. Juan Perez", "jperez@gmail.com",
      "Av. Pedro Carbo y Sucre 512", "2645987", "2978504")
      .then(function (ids) {
        ids.should.not.be.empty
        ids[0].should.be.a('number')
        return db.insertarCliente("0934233576001", "Carlos Sanchez",
        "carlos-sanchez84@live.com", "Av. Brasil y la del ejercito", "2353477", "2375980")
      }).then(function(ids) {
        ids.should.not.be.empty
        ids[0].should.be.a('number')
        done()
      })

    })

  })

  describe('findClientes', function () {

    it('retorna un array con todos los clientes existentes si se le pasa un string vacio', function (done) {
      db.findClientes('')
      .then(function(clientes) {
        clientes.should.be.an('array')
        clientes.should.not.be.empty
        done()
      })
    })

    it('puede buscar clientes por nombre, si se le pasa un string no vacio como argumento', function (done) {
      db.findClientes('Juan Carlos')
      .then(function(clientes) {
        clientes.should.be.an('array')
        //Esto asume que en el describe anterior se ingresaron unicamente Juan Perez y Carlos Sanchez
        clientes.length.should.be.equal(2)
        clientes[0].nombre.should.be.equal('Dr. Juan Perez')
        clientes[1].nombre.should.be.equal('Carlos Sanchez')
        done()
      })
    })

  })

  describe('insertarVenta', function() {

    it('persiste una nueva venta en la base y agrega las unidades vendidas a la base',
      function (done) {
        db.insertarVenta('gfg5', '10954236576001', '2016-11-26', 'fse4', 'VISA',
        21.00, 3.12, 5.43, 38.12)
        .then(function (ids) {
          ids.should.not.be.empty
          ids[0].should.be.a('number')
          done()
        })
      })
  })

})