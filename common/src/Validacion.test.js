const Validacion = require('./Validacion.js');

describe('Validacion', () => {
  describe('validarCliente', () => {
    it('retorna unicamente "inputs" si el cliente es correcto', () => {
      const cliente = {
        id: '0954678865001',
        nombre: 'Gustavo Quinteros',
        apellido: 'Quinteros',
        telefono1: '566543',
        direccion: 'calle 34',
        email: 'gquinteros@gmail.com',
        tipo: 'ruc'
      };

      const { errors, inputs } = Validacion.validarClienteInsert(cliente);

      expect(errors).toBeNull();
      expect(inputs).toEqual({
        id: '0954678865001',
        nombre: 'Gustavo Quinteros',
        apellido: 'Quinteros',
        telefono1: '566543',
        telefono2: '',
        direccion: 'calle 34',
        email: 'gquinteros@gmail.com',
        tipo: 'ruc',
        descDefault: 0
      });
    });
  });

  describe('validarBusqueda', () => {
    it('retorna null los parametros son incorrectos', () => {
      let errors = Validacion.validarBusqueda('ar', 'e4');
      expect(errors).not.toBeNull();
      errors = Validacion.validarBusqueda(5, 4);
      expect(errors).not.toBeNull();
      errors = Validacion.validarBusqueda('ar', '4');
      expect(errors).toBeNull();
    });
  });
});
