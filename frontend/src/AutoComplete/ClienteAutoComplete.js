import React from 'react';

import { findClientesFactura } from 'facturacion_common/src/api.js';
import AutoCompleteComponent from '../lib/AutoCompleteComponent';

const dataSourceConfig = {
  text: 'nombreApellido',
  value: 'id'
};

export default class ClienteAutoComplete extends React.Component {
  render() {
    return (
      <AutoCompleteComponent
        hintText="Socio"
        style={{ marginRight: '36px' }}
        openOnFocus={false}
        dataSourceConfig={dataSourceConfig}
        newDataPromise={findClientesFactura}
        onNewItemSelected={this.props.onNewItemSelected}
        width={this.props.width}
      />
    );
  }
}
