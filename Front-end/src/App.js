import React from 'react';

import {
    BrowserRouter as Router,
    Switch,
    Route
} from "react-router-dom";

import {ThemeProvider} from '@material-ui/core/styles';
import {Web3ReactProvider} from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers'
import BuyingPage from './pages/BuyingPage';
import {defaultTheme} from './Themes'
import CheckoutPage from './pages/CheckoutPage';

function getLibrary(provider){
    const library = new Web3Provider(provider)
    library.pollingInterval = 12000
    return library
}

const App = () => {
    return (
        <Web3ReactProvider getLibrary={getLibrary}>
            <Router>
                <Switch>
                    <ThemeProvider theme={defaultTheme}>
                        <Route exact path="/">
                            <BuyingPage/>
                        </Route>
                        <Route exact path="/check">
                            <CheckoutPage/>
                        </Route>
                    </ThemeProvider>
                </Switch>
            </Router>
        </Web3ReactProvider>
    );
}


export default App