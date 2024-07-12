import React, { Component } from 'react';

import PaperContainer from '../lib/PaperContainer';
import FacturaForm from './FacturaForm';
import FacturaTable from './FacturaTable';
import FacturaResults from './FacturaResults';
import ComprobanteDialog from './ComprobanteDialog';
import { getFacturaURL } from 'facturacion_common/src/api';
import * as Actions from './EditorActions.js';
import { createReducer, getDefaultState } from './EditorReducers.js';
import { recoverDraft, saveDraft, deleteDraft } from './Draft.js';
import { updateState } from '../Arch.js';
import { calcularValoresFacturables } from 'facturacion_common/src/Math.js';
import appSettings from '../Ajustes';

const getDatilURL = id => `http://181.120.103.108:8192/venta/ver/${id}`;

const getInsertOkMsg = editar =>
  editar
    ? 'La factura se editó exitosamente'
    : 'La factura se guardó exitosamente';

export default class FacturaEditorView extends Component {
  static createKey(isExamen, id) {
    return isExamen ? 'examen_' + id : 'productos_' + id;
  }

  constructor(props) {
    super(props);
    this.createReducer = createReducer;

    // buscar si hay un draft que podemos recuperar
    const { ventaId, isExamen } = props;
    const draft = recoverDraft(this.constructor.createKey(isExamen, ventaId));
    if (draft) {
      this.state = draft;
      return;
    }

    // No tiene draft, usar default state y ver si hay que editar
    // una factura del servidor
    this.state = getDefaultState();
    Promise.resolve().then(() => {
      updateState(this, {
        type: Actions.getFacturaExistente,
        ventaId,
        isExamen
      });
    });
  }

  onFacturaInputChanged = (key, value) => {
    this.shouldSave = true;
    updateState(this, { type: Actions.updateFacturaInput, key, value });
  };

  onFacturableChanged = (index, key, value) => {
    this.shouldSave = true;
    updateState(this, { type: Actions.updateUnidadInput, index, key, value });
  };

  onFacturableDeleted = index => {
    updateState(this, { type: Actions.removeUnidad, index });
  };

  onNewCliente = clienteRow => {
    this.shouldSave = true;
    updateState(this, { type: Actions.setCliente, clienteRow });
  };

  onNewMedico = medicoRow => {
    this.shouldSave = true;
    updateState(this, { type: Actions.setMedico, medicoRow });
  };

  onNewProductFromKeyboard = productoRow => {
    this.shouldSave = true;
    updateState(this, { type: Actions.agregarProducto, productoRow });
  };

  updatePagos = pagos => {
    this.shouldSave = true;
    updateState(this, { type: Actions.updatePagos, pagos });
  };

  clearFacturaEditorOk = (msg, link) => {
    const { isExamen, ventaId } = this.props;
    this.shouldSave = false;
    deleteDraft(this.constructor.createKey(isExamen, ventaId));
    this.props.clearFacturaEditorOk(msg, link);
  };

  onGenerarFacturaClick = () => {
    const { empresa, iva } = appSettings;
    const { isExamen, ventaId } = this.props;
    const editar = ventaId !== 'new';

    const config = { empresa, iva, isExamen, editar };
    const callback = ({ success, ...extras }) => {
      if (!success) {
        this.props.mostrarErrorConSnackbar(extras.msg);
        return;
      }

      const pdfLink = getFacturaURL(extras.rowid);
      window.open(pdfLink);
      const msg = getInsertOkMsg(editar);
      this.clearFacturaEditorOk(msg, pdfLink);
    };

    updateState(this, {
      type: Actions.guardarFactura,
      config,
      callback
    });
  };

  abrirPagosForUpdate = total => {
    if (total === 0)
      this.props.mostrarErrorConSnackbar('No hay nada que pagar.');
    else {
      const originalPagos =
        this.state.pagos.length < 2
          ? [...this.state.pagos, { formaPagoText: '', valorText: '' }]
          : this.state.pagos;
      this.props.abrirPagos({
        total,
        originalPagos,
        onSaveData: this.updatePagos
      });
    }
  };

  resetearConMsg = (msg, id) => {
    updateState(this, { type: Actions.getDefaultState });
    const pdfLink = getDatilURL(id);
    window.open(pdfLink);
    Promise.resolve().then(() => this.clearFacturaEditorOk(msg, pdfLink));
  };

  editarFacturaActual = id => {
    const { ventaId, isExamen } = this.props;
    if (ventaId === id)
      updateState(this, { type: Actions.cerrarComprobanteDialog });

    const editarFn = isExamen
      ? this.props.editarFacturaExamen
      : this.props.editarFactura;
    editarFn(ventaId);
  };

  componentWillUnmount() {
    const { isExamen, ventaId } = this.props;
    if (this.shouldSave)
      saveDraft(this.constructor.createKey(isExamen, ventaId), this.state);
  }

  render() {
    const {
      clienteRow,
      errors,
      unidades,
      inputs,
      medicoRow,
      pagos,
      guardando
    } = this.state;

    const { isExamen, ventaId } = this.props;

    // se permite usar string vacio como 0 asi que
    // hay que sanitizar
    const descuento = inputs.descuento === '' ? 0 : inputs.descuento;
    const flete = inputs.flete === '' ? 0 : inputs.flete;

    const errorUnidades = errors && errors.unidades;
    const detallado = inputs.detallado;
    const iva = isExamen ? 0 : appSettings.iva;
    const { subtotal, rebaja, impuestos, total } = calcularValoresFacturables({
      unidades,
      descuento,
      iva,
      flete
    });

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
            <FacturaForm
              data={inputs}
              errors={errors}
              cliente={clienteRow}
              medico={medicoRow}
              pagos={pagos}
              updatePagos={this.updatePagos}
              onDataChanged={this.onFacturaInputChanged}
              ventaId={ventaId}
              onNewMedico={this.onNewMedico}
              onNewCliente={this.onNewCliente}
              onNewProduct={this.onNewProductFromKeyboard}
              abrirPagosForUpdate={() => this.abrirPagosForUpdate(total)}
              isExamen={isExamen}
            />
            <FacturaTable
              items={unidades}
              onFacturableChanged={this.onFacturableChanged}
              onFacturableDeleted={this.onFacturableDeleted}
              isExamen={isExamen}
            />
            <FacturaResults
              errorUnidades={errorUnidades}
              subtotal={subtotal}
              rebaja={rebaja}
              impuestos={impuestos}
              total={total}
              porcentajeIVA={iva}
              contable={inputs.contable}
              contableDisabled={!appSettings.main || inputs.contableDisabled}
              guardando={guardando}
              detallado={detallado}
              onGuardarClick={this.onGenerarFacturaClick}
              onFacturaDataChanged={this.onFacturaInputChanged}
              nuevo={!ventaId}
              guardarButtonDisabled={false}
              isExamen={isExamen}
            />
            <ComprobanteDialog
              ventaId={this.state.emitiendo ? this.state.emitiendo.ventaId : 0}
              editarFactura={this.editarFacturaActual}
              cerrarConMsg={this.resetearConMsg}
            />
          </div>
        </PaperContainer>
      </div>
    );
  }
}

FacturaEditorView.propTypes = {
  abrirPagos: React.PropTypes.func.isRequired,
  mostrarErrorConSnackbar: React.PropTypes.func.isRequired,
  clearFacturaEditorOk: React.PropTypes.func.isRequired,
  editarFactura: React.PropTypes.func.isRequired,
  editarFacturaExamen: React.PropTypes.func.isRequired,
  isExamen: React.PropTypes.bool.isRequired,
  ventaId: React.PropTypes.string.isRequired
};
