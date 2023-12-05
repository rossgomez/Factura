import React from 'react';
import PaperContainer from '../lib/PaperContainer';
import {
  getFacturaURL,
  findAllVentas,
  deleteVenta
} from 'facturacion_common/src/api';

import MaterialTable from '../lib/MaterialTable';
import ListState from './ListState';
import appSettings from '../Ajustes';
import XLSX from 'xlsx';

const ColumnTypes = MaterialTable.ColumnTypes;
//const columns = ['# Comprobante', 'Empresa', 'Fecha', 'Cliente', 'Total'];
//const keys = ['comprobante', 'empresa', 'fechaText', 'nombre', 'total'];

const columns = [
  '# Comprobante',
  '#Cedula/RUC',
  'Nombre',
  'Apellido',
  'Fecha',
  'Total'
];
const keys = [
  'comprobante',
  'cliente_id',
  'nombre',
  'apellido',
  'fechaText',
  'total'
];

const columnTypes = [
  ColumnTypes.string,
  ColumnTypes.string,
  ColumnTypes.string,
  ColumnTypes.string,
  ColumnTypes.string,
  ColumnTypes.string,
  ColumnTypes.numeric
];
const searchHint = 'Buscar facturas...';
const exportButtonLabel = 'Exportar a Excel';

export default class FacturasListView extends React.Component {
  constructor(props) {
    super(props);
    this.stateManager = new ListState(props, args => this.setState(args));
    this.state = {
      rows: [],
      startDate: null,
      endDate: null
    };
  }

  handleStartDateChange = date => {
    this.setState({ startDate: date });
  };

  handleEndDateChange = date => {
    this.setState({ endDate: date });
  };

  componentWillReceiveProps = nextProps => {
    this.stateManager.props = nextProps;
  };

  openFacturaInNewTab = index => {
    const { rowid } = this.state.rows[index];
    const facturaURL = getFacturaURL(rowid);
    window.open(facturaURL);
  };

  openEditorPage = index => {
    const { rowid, tipo } = this.state.rows[index];
    this.stateManager.openEditorPage(rowid, tipo);
  };

  deleteRow = index => {
    const { rowid } = this.state.rows[index];
    deleteVenta(rowid).then(() => {
      this.stateManager.deleteVenta(rowid);
    });
  };

  requestData = input => {
    findAllVentas(appSettings.empresa, input).then(
      resp => {
        const listaVentas = resp.body;
        this.stateManager.colocarVentas(listaVentas);
      },
      err => {
        if (err.status === 404) {
          this.stateManager.colocarVentas([]);
        }
      }
    );
  };

  componentDidMount() {
    this.requestData('');
  }

  render() {
    const rows = this.state.rows;

    return (
      <div style={{ height: '100%', overflow: 'auto' }}>
        <PaperContainer>
          <div
            style={{
              marginTop: '24px',
              marginLeft: '36px',
              marginRight: '36px'
            }}
          >
            <input
              type="date"
              value={this.state.startDate}
              onChange={e => this.handleStartDateChange(e.target.value)}
            />
            <input
              type="date"
              value={this.state.endDate}
              onChange={e => this.handleEndDateChange(e.target.value)}
            />

            <button onClick={this.exportToExcel}>{exportButtonLabel}</button>
            <MaterialTable
              columns={columns}
              columnTypes={columnTypes}
              enableCheckbox={false}
              keys={keys}
              rows={rows}
              searchHint={searchHint}
              onDeleteItem={this.deleteRow}
              onEditItem={this.openEditorPage}
              onOpenItem={this.openFacturaInNewTab}
              isMutableItem={item => !item.id}
              height={'450px'}
              onQueryChanged={this.requestData}
            />
          </div>
        </PaperContainer>
      </div>
    );
  }

  exportToExcel = () => {
    const { rows } = this.state;

    // Seleccionar solo las columnas que deseas exportar
    const selectedColumns = rows.map(
      ({ comprobante, nombre, apellido, fechaText, total }) => ({
        comprobante,
        nombre,
        apellido,
        fechaText,
        total
      })
    );

    // Crear una hoja de cálculo
    const ws = XLSX.utils.json_to_sheet(selectedColumns);

    // Crear un libro de trabajo
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Facturas');

    // Guardar el archivo como Excel
    XLSX.writeFile(wb, 'facturas.xlsx');
  };
}

FacturasListView.propTypes = {
  editarFactura: React.PropTypes.func.isRequired,
  editarFacturaExamen: React.PropTypes.func.isRequired
};
