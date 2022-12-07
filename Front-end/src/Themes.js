import {createTheme} from "@material-ui/core/styles";

export const defaultTheme = createTheme({
    spacing: 5,
    palette: {
        primary:{
            light: '#7986cb',
            main: '#3f51b5',
            dark: '#303f9f',
        },
        secondary: {
            main: '#ff4081',
        },
    },
});