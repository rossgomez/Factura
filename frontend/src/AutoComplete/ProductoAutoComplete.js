import React from 'react';

import { findProductos } from 'facturacion_common/src/api.js';
import AutoCompleteComponent from '../lib/AutoCompleteComponent';

const dataSourceConfig = {
  text: 'codigo',
  value: 'codigo'
};

export default class ProductoAutoComplete extends React.Component {
  render() {
    const { isExamen } = this.props;
    const newDataPromise = queryString =>
      findProductos({
        pagaIva: !isExamen,
        queryString
      });

    return (
      <AutoCompleteComponent
        hintText="Concepto"
        dataSourceConfig={dataSourceConfig}
        newDataPromise={newDataPromise}
        onNewItemSelected={this.props.onNewItemSelected}
        width={this.props.width}
      />
    );
  }
}

ProductoAutoComplete.propTypes = {
  isExamen: React.PropTypes.bool.isRequired
};
