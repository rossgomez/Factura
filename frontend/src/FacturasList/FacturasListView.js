import React from 'react';
import PaperContainer from '../lib/PaperContainer';
import {
  getFacturaURL,
  findAllVentas,
  deleteVenta,
  archivoBase
} from 'facturacion_common/src/api';

import MaterialTable from '../lib/MaterialTable';
import ListState from './ListState';
import appSettings from '../Ajustes';
import XLSX from 'xlsx';
import { fs } from 'fs';
//const fs = require('fs');
import axios from 'axios';
import XlsxPopulate from 'xlsx-populate';

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
      startDate: '',
      endDate: ''
    };
  }

  handleStartDateChange = date => {
    this.setState({ startDate: date });
    this.state.startDate = date;
    this.requestData('');
  };

  handleEndDateChange = date => {
    this.setState({ endDate: date });
    this.state.endDate = date;
    this.requestData('');
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
    findAllVentas(
      appSettings.empresa,
      input,
      this.state.startDate,
      this.state.endDate
    ).then(
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
    const { startDate, endDate } = this.state;

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
    axios
      .get(`http://localhost:8192/obtener-archivo-base`, {
        responseType: 'arraybuffer'
      })
      .then(response => {
        const arrayBuffer = response.data;

        // Leer el archivo Excel
        XlsxPopulate.fromDataAsync(arrayBuffer)
          .then(workbook => {
            // Aquí puedes agregar lógica para modificar el contenido del archivo
            // Por ejemplo, agregar datos a una hoja específica
            /*  const nuevaData = 'Hola, este es un nuevo dato';
          workbook.sheet(0).cell("A1").value(nuevaData); */

            // Obtener los datos del estado
            const { rows } = this.state;

            // Seleccionar solo las columnas que deseas exportar
            const selectedColumns = rows.map(
              ({
                comprobante,
                nombre,
                apellido,
                cliente_id,
                fechaText,
                total
              }) => ({
                comprobante,
                nombre,
                apellido,
                cliente_id,
                fechaText,
                total
              })
            );

            // Definir el mapeo de columnas y celdas
            const columnMappings = {
              nro: 'B',
              comprobante: 'C',
              nombre: 'D',
              apellido: 'E',
              cliente_id: 'F',
              fechaText: 'G',
              total: 'H'
              // Agrega más columnas según sea necesario
            };

            const sheet = workbook.sheet(0);

            // Llenar el archivo Excel con los datos seleccionados
            selectedColumns.forEach((row, rowIndex) => {
              // Incrementar el número por cada fila
              row.nro = rowIndex + 1;

              Object.keys(row).forEach(column => {
                const cell = columnMappings[column] + (rowIndex + 5);

                // Verificar si la columna es "TOTAL" y convertir a número
                if (column === 'total') {
                  sheet.cell(cell).value(parseFloat(row[column]));
                } else {
                  sheet.cell(cell).value(row[column]);
                }

                // Agregar contorno de negrita a la celda
                sheet.cell(cell).style({
                  border: {
                    top: { style: 'thin' },
                    bottom: { style: 'thin' },
                    left: { style: 'thin' },
                    right: { style: 'thin' }
                  } // Hacer que el texto sea negrita
                });
              });
            });
            // Calcular la suma de la columna "TOTAL" (convertir a números primero)
            const totalSum = selectedColumns.reduce(
              (sum, row) => sum + parseFloat(row.total),
              0
            );

            // Obtén la última fila donde se insertarán los datos
            const lastRowIndex = selectedColumns.length + 5;

            // Insertar una nueva fila para la suma de la columna "TOTAL"
            const totalCell = 'H' + (lastRowIndex + 1); // Se asume que tus datos comienzan en la fila 5
            workbook
              .sheet(0)
              .cell(totalCell)
              .value('Total:');
            workbook
              .sheet(0)
              .cell(totalCell)
              .style({
                bold: true,
                horizontalAlignment: 'center',
                fill: {
                  type: 'solid',
                  color: 'bdd7ee',
                  border: {
                    top: { style: 'thin' },
                    bottom: { style: 'thin' },
                    left: { style: 'thin' },
                    right: { style: 'thin' }
                  } // Código hexadecimal del color celeste
                }
              });

            // Combinar celdas a la izquierda para el título
            const mergedRange = `B${lastRowIndex + 1}:G${lastRowIndex + 1}`;
            workbook
              .sheet(0)
              .range(mergedRange)
              .merged(true)
              .style({
                border: {
                  top: { style: 'thin' },
                  bottom: { style: 'thin' },
                  left: { style: 'thin' },
                  right: { style: 'thin' }
                } // Hacer que el texto sea negrita
              });
            workbook
              .sheet(0)
              .cell(`B${lastRowIndex + 1}`)
              .value('TOTAL PAGADO')
              .style({
                bold: true,
                horizontalAlignment: 'center',
                fill: {
                  type: 'solid',
                  color: 'bdd7ee',
                  border: {
                    top: { style: 'thin' },
                    bottom: { style: 'thin' },
                    left: { style: 'thin' },
                    right: { style: 'thin' }
                  } // Código hexadecimal del color celeste
                }
              });

            // Insertar la fórmula de suma en la celda combinada
            workbook
              .sheet(0)
              .cell(totalCell)
              .formula(`SUM(H5:H${lastRowIndex})`);
            workbook
              .sheet(0)
              .cell(totalCell)
              .style({
                border: {
                  top: { style: 'thin' },
                  bottom: { style: 'thin' },
                  left: { style: 'thin' },
                  right: { style: 'thin' }
                }
              });

            // Agregar dos nombres y carga para firma debajo del total con 5 espacios en blanco
            // Agregar dos nombres y carga para firma debajo del total con 5 espacios en blanco
            const firmaRow = lastRowIndex + 5; // Ajusta según sea necesario
            workbook
              .sheet(0)
              .cell(`D${firmaRow}`)
              .value('Mírian Rosenbaum')
              .style({ horizontalAlignment: 'center', bold: true });
            workbook
              .sheet(0)
              .cell(`D${firmaRow + 1}`)
              .value('Presidente')
              .style({ horizontalAlignment: 'center', bold: true });

            workbook
              .sheet(0)
              .cell(`F${firmaRow}`)
              .value('Dr. Ramón López')
              .style({ horizontalAlignment: 'center', bold: true });
            workbook
              .sheet(0)
              .cell(`F${firmaRow + 1}`)
              .value('Presidente')
              .style({ horizontalAlignment: 'center', bold: true });

            // Guardar el libro de trabajo modificado como un Blob
            return workbook.outputAsync();
          })
          .then(blob => {
            // Crear enlace para descargar el archivo actualizado
            const url = window.URL.createObjectURL(
              new Blob([blob], {
                type:
                  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
              })
            );
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'reporte.xlsx');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          })
          .catch(error => {
            console.error('Error al modificar el archivo Excel', error);
          });
      })
      .catch(error => {
        console.error('Error al obtener el archivo', error);
      });
  };

  /*
    archivoBase().then(
        resp => {

          console.log(resp)



          const data = resp.data;
          alert('leyendo')

           // Crea un archivo local para guardar el contenido del archivo Excel
        const writer = fs.createWriteStream('ejemplo.xlsx');
        resp.data.pipe(writer);
        alert('leyendo 2')

        // Maneja el evento de finalización de la escritura
        return new Promise((resolve, reject) => {
          alert('leyendo 3')
          writer.on('finish', resolve);
          alert('leyendo 4')
          writer.on('error', reject);
          alert('leyendo 5')
        });
    
          // Crear un libro de trabajo y leer la hoja de cálculo
          const workbook = XLSX.read(data, { type: 'binary' });
          alert('leido')
          const sheetName = 'Facturas';
          const ws = workbook.Sheets[sheetName];
      
          // Obtener los datos del estado
          const { rows } = this.state;
      
          // Seleccionar solo las columnas que deseas exportar
          const selectedColumns = rows.map(
            ({ comprobante, nombre, apellido, cliente_id, fechaText, total }) => ({
              comprobante,
              nombre,
              apellido,
              cliente_id,
              fechaText,
              total
            })
          );
      
          // Definir el mapeo de columnas y celdas
          const columnMappings = {
            comprobante: 'B',
            nombre: 'C',
            apellido: 'D',
            cliente_id: 'E',
            fechaText: 'F',
            total: 'G',
            // Agrega más columnas según sea necesario
          };
      
          // Llenar las celdas en la hoja de cálculo con los datos seleccionados
          selectedColumns.forEach((rowData, rowIndex) => {
            Object.entries(rowData).forEach(([columnName, value]) => {
              const cellAddress = columnMappings[columnName] + (rowIndex + 2); // Se suma 2 porque las filas en Excel comienzan desde 1
              ws[cellAddress] = { v: value };
            });
          });
      
          // Guardar el archivo modificado
          XLSX.writeFile(workbook, 'facturas_modificado.xlsx');
        },
        err => {
          if (err.status === 404) {
            
          }
        }
      );

  }*/
}

FacturasListView.propTypes = {
  editarFactura: React.PropTypes.func.isRequired,
  editarFacturaExamen: React.PropTypes.func.isRequired
};
