import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { greenAporte, pink300 } from 'material-ui/styles/colors';

export const myTheme = color =>
  getMuiTheme({
    palette: {
      primary1Color: color
    }
  });

export const getEmpresaTheme = main => {
  const color = main ? greenAporte : pink300;
  return myTheme(color);
};
