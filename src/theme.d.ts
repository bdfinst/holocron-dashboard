import { ThemeOptions as _ } from '@mui/material/styles'
/**
 * using module augmentation to declare theme type
 * in themes folder using this video
 * https://www.youtube.com/watch?v=ZyQlpX7lCRE
 * and this stackoverflow link as
 * https://stackoverflow.com/questions/59365396/how-to-use-material-ui-custom-theme-in-react-with-typescript
 * additional with MUI docs: https://mui.com/material-ui/customization/theming/#custom-variables
 */
declare module '@mui/material/styles' {
  interface Palette {
    link: string
    menu: { main: string }
    header: string
    textboxPlaceHolder: string
  }

  // additional configurations in theme.palette
  interface PaletteOptions {
    link?: string
    menu?: { main: string }
    header?: string
    textboxPlaceHolder?: string
  }

  interface Theme {
    background: string
    chart: {
      axis: {
        fill: string
      }
      yellow: string
      blue: string
      red: string
      green: string
      orange: string
      fillTransparencyPct: number
    }
  }

  // allow configuration using `createTheme`
  interface ThemeOptions {
    // additional variables in theme, can be accessed by theme.<variable_name> e.g. theme.background
    background?: string
    chart?: {
      axis: {
        fill: string
      }
      yellow: string
      blue: string
      red: string
      green: string
      orange: string
      fillTransparencyPct: number
    }
  }
}
