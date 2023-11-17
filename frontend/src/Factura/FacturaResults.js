import React from 'react';

import Checkbox from 'material-ui/Checkbox';
import RaisedButton from 'material-ui/RaisedButton';
import CircularProgress from 'material-ui/CircularProgress';

import Money from 'facturacion_common/src/Money.js';

import ServerErrorText from '../lib/formTable/ServerErrorText';

const ivaLabel = porcentajeIVA => `IVA ${porcentajeIVA}%: $`;
const nuevoLabel = 'Generar Factura';
const editarLabel = 'Guardar Cambios';
const errorMsgStyle = {
  fontSize: '14px',
  textAlign: 'left'
};

const ResultsTable = props => {
  /*
  const { isExamen, porcentajeIVA } = props;
  const subtotal = Money.print(props.subtotal);
  const rebaja = Money.print(props.rebaja);
  const impuestos = Money.print(props.impuestos);
  const total = Money.print(props.total);
  */

  const { isExamen, porcentajeIVA } = props;
  const subtotal = Money.print(props.subtotal);
  const rebaja = 0;
  const impuestos = 0;
  const total = Money.print(props.total);

  const ivaRow = isExamen ? null : (
    <tr>
      <td>
        <strong>IVA 5%: ₲</strong>
      </td>
      <td>{impuestos}</td>
    </tr>
  );
  return (
    <div style={{ float: 'right' }}>
      <table
        style={{ width: 'auto', display: 'inline-table', textAlign: 'right' }}
      >
        <tbody>
          <tr>
            <td>
              <strong>Exentas: ₲</strong>
            </td>
            <td style={{ paddingLeft: '20px' }}>{subtotal}</td>
          </tr>
          {ivaRow}
          <tr>
            <td>
              <strong>IVA 10%: ₲</strong>
            </td>
            <td>{rebaja}</td>
          </tr>
          <tr>
            <td>
              <strong>Total: ₲</strong>
            </td>
            <td>{total}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const FacturaOptions = props => {
  const {
    detallado,
    contableDisabled,
    contable,
    isExamen,
    onFacturaDataChanged
  } = props;

  const contableCheckbox = (
    <Checkbox
      label={'Generar comprobante'}
      style={{ textAlign: 'left' }}
      checked={contable}
      disabled={contableDisabled}
      onCheck={(event, isChecked) => {
        onFacturaDataChanged('contable', isChecked);
      }}
    />
  );
  const detalladoCheckbox = (
    <Checkbox
      label={'Mostrar Información detallada en cada Concepto'}
      style={{ textAlign: 'left' }}
      checked={isExamen ? false : detallado}
      disabled={isExamen}
      onCheck={(event, isChecked) => {
        onFacturaDataChanged('detallado', isChecked);
      }}
    />
  );

  return (
    <div style={{ width: '420px', float: 'left' }}>
      {contableCheckbox}
      {isExamen ? null : detalladoCheckbox}
    </div>
  );
};

const GuardarFacturaButton = props => {
  const { nuevo, guardando, guardarButtonDisabled, onGuardarClick } = props;
  const label = nuevo ? nuevoLabel : editarLabel;
  const childItem = guardando ? (
    <CircularProgress />
  ) : (
    <RaisedButton
      label={label}
      primary={true}
      onTouchTap={onGuardarClick}
      disabled={guardarButtonDisabled}
    />
  );
  return <div style={{ textAlign: 'center' }}>{childItem}</div>;
};

export default class FacturaResults extends React.Component {
  render() {
    return (
      <div style={{ width: '100%', paddingTop: '6px' }}>
        <ServerErrorText style={errorMsgStyle}>
          {this.props.errorUnidades}
        </ServerErrorText>
        <div style={{ overflow: 'auto' }}>
          <FacturaOptions {...this.props} />
          <ResultsTable {...this.props} />
        </div>
        <GuardarFacturaButton {...this.props} />
      </div>
    );
  }
}

FacturaResults.propTypes = {
  errorUnidades: React.PropTypes.string,
  isExamen: React.PropTypes.bool,
  contable: React.PropTypes.bool,
  contableDisabled: React.PropTypes.bool,
  guardando: React.PropTypes.bool,
  detallado: React.PropTypes.bool.isRequired,
  rebaja: React.PropTypes.number.isRequired,
  subtotal: React.PropTypes.number.isRequired,
  impuestos: React.PropTypes.number,
  total: React.PropTypes.number.isRequired,
  onGuardarClick: React.PropTypes.func,
  onFacturaDataChanged: React.PropTypes.func.isRequired,
  nuevo: React.PropTypes.bool.isRequired,
  porcentajeIVA: React.PropTypes.number
};

FacturaResults.defaultProps = {
  isExamen: false
};
