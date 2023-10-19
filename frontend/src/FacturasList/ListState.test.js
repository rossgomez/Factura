import ListState from './ListState.js';

let state;
const setStateFunc = funcArg => {
  state = Object.assign(state, funcArg(state));
};

describe('Factura ListView State', () => {
  beforeAll(() => {
    state = { rows: [] };
  });

  describe('colocarVentas', () => {
    it('coloca la lista de ventas en el state venta del state', () => {
      const newVentas = [
        {
          id: 'e8feh5',
          secuencial: 21,
          empresa: 'TECO',
          fecha: '2019-07-04T06:31:19.983Z',
          subtotal: 100000,
          iva: 12,
          flete: 0,
          descuento: 0
        },
        {
          empresa: 'TECO',
          fecha: '2019-07-04T06:32:19.983Z',
          subtotal: 100000,
          iva: 12,
          flete: 0,
          descuento: 0
        }
      ];
      const stateManager = new ListState({}, setStateFunc);
      stateManager.colocarVentas(newVentas);
      expect(state).toEqual({
        rows: [
          {
            comprobante: '000000021',
            secuencial: 21,
            id: 'e8feh5',
            empresa: 'TECO',
            fechaText: '2019-07-04 01:31',
            fecha: '2019-07-04T06:31:19.983Z',
            total: '11.20',
            subtotal: 100000,
            iva: 12,
            flete: 0,
            descuento: 0
          },
          {
            comprobante: '000000022',
            empresa: 'TECO',
            fecha: '2019-07-04T06:32:19.983Z',
            fechaText: '2019-07-04 01:32',
            total: '11.20',
            subtotal: 100000,
            iva: 12,
            flete: 0,
            descuento: 0
          }
        ]
      });

      stateManager.colocarVentas([]);
      expect(state).toEqual({ rows: [] });
    });
  });

  describe('deleteVenta', () => {
    it('remueve una venta del state', () => {
      state.rows = [
        { rowid: 1, codigo: '00435', empresa: 'TECO' },
        { rowid: 2, codigo: '00434', empresa: 'TECO' }
      ];
      const stateManager = new ListState({}, setStateFunc);
      stateManager.deleteVenta(0);
      expect(state).toEqual({
        rows: [{ rowid: 1, codigo: '00435', empresa: 'TECO' }]
      });
    });
  });

  describe('openEditorPage', () => {
    it('ejecuta accion editarFactura en props si tipo es 0', () => {
      let success = false;
      const props = {
        editarFactura: () => {
          success = true;
        },
        editarFacturaExamen: () => {
          success = false;
        }
      };
      const stateManager = new ListState(props, setStateFunc);
      stateManager.openEditorPage(1, 0);
      expect(success).toEqual(true);
    });

    it('ejecuta accion editarFacturaExamen en props si tipo es 1', () => {
      let success = false;
      const props = {
        editarFactura: () => {
          success = false;
        },
        editarFacturaExamen: () => {
          success = true;
        }
      };
      const stateManager = new ListState(props, setStateFunc);
      stateManager.openEditorPage('00546', 'TECO', 1);
      expect(success).toBe(true);
    });

    it('ejecuta la accion correcta incluso si props es seteado despues de llamar al constructor', () => {
      let success = false;
      const props = {
        editarFactura: () => {
          success = true;
        },
        editarFacturaExamen: () => {
          success = false;
        }
      };
      const stateManager = new ListState({}, setStateFunc);
      stateManager.props = props;
      stateManager.openEditorPage(1, 0);
      expect(success).toBe(true);
    });
  });
});
