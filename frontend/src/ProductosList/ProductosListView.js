import React from 'react';
import { findProductos, deleteProducto } from 'facturacion_common/src/api';

import MaterialTable from '../lib/MaterialTable';
import ListState from './ListState';

const ColumnTypes = MaterialTable.ColumnTypes;
const columns = ['Concepto', 'Precio Venta'];
const keys = ['codigo', 'precioVentaText'];
const columnTypes = [ColumnTypes.string, ColumnTypes.numeric];
const searchHint = 'Buscar Conceptos...';

export default class ProductosListView extends React.Component {
  constructor(props) {
    super(props);
    this.stateManager = new ListState(props, args => this.setState(args));
    this.state = {
      rows: []
    };
  }

  requestData = input => {
    const {
      colocarListaVacia,
      colocarProductosDelResponse
    } = this.stateManager;
    findProductos({ queryString: input, limit: 50 }).then(
      colocarProductosDelResponse,
      colocarListaVacia
    );
  };

  deleteRow = index => {
    const { rowid } = this.state.rows[index];
    const { removerProductoDeLaLista, mostrarError } = this.stateManager;

    const handleSuccess = () => removerProductoDeLaLista(rowid);
    deleteProducto(rowid).then(handleSuccess, mostrarError);
  };

  editRow = index => {
    const objetoAEditar = this.state.rows[index];
    this.stateManager.colocarListaVacia();
    this.props.editarProducto(objetoAEditar);
  };

  componentWillReceiveProps = nextProps => {
    this.stateManager.props = nextProps;
    if (this.state.rows.length === 0) this.requestData('');
  };

  componentDidMount() {
    this.requestData('');
  }

  render() {
    const rows = this.state.rows;
    return (
      <MaterialTable
        columns={columns}
        columnTypes={columnTypes}
        enableCheckbox={false}
        keys={keys}
        rows={rows}
        searchHint={searchHint}
        height={'450px'}
        onQueryChanged={this.requestData}
        onDeleteItem={this.deleteRow}
        onEditItem={this.editRow}
      />
    );
  }
}

ProductosListView.propTypes = {
  mostrarErrorConSnackbar: React.PropTypes.func.isRequired,
  editarProducto: React.PropTypes.func.isRequired
};
