import React from 'react';
import { findClientes, deleteCliente } from 'facturacion_common/src/api';

import MaterialTable from '../lib/MaterialTable';
import ListState from './ListState';

const columns = ['#Cedula/RUC', 'Nombre', 'Apellido', 'E-mail', 'Teléfono 1'];
const keys = ['id', 'nombre', 'apellido', 'email', 'telefono1'];
const searchHint = 'Buscar socio...';

export default class ClientesListView extends React.Component {
  constructor(props) {
    super(props);
    this.stateManager = new ListState(props, args => this.setState(args));
    this.state = {
      rows: []
    };
  }

  requestData = input => {
    const { colocarListaVacia, colocarClientesDelResponse } = this.stateManager;
    findClientes(input, 50).then(colocarClientesDelResponse, colocarListaVacia);
  };

  deleteRow = index => {
    const { ruc } = this.state.rows[index];
    const { removerClienteDeLaLista, mostrarError } = this.stateManager;

    const handleSuccess = () => removerClienteDeLaLista(ruc);
    deleteCliente(ruc).then(handleSuccess, mostrarError);
  };

  editRow = index => {
    const objetoAEditar = this.state.rows[index];
    this.stateManager.colocarListaVacia();
    this.props.editarCliente(objetoAEditar);
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

ClientesListView.propTypes = {
  mostrarErrorConSnackbar: React.PropTypes.func.isRequired,
  editarCliente: React.PropTypes.func.isRequired
};
