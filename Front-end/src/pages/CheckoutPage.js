import React, {useState, useEffect} from 'react';

import {useHistory} from "react-router-dom";
import {ethers} from 'ethers'
import {makeStyles} from '@material-ui/core/styles';
import {useTheme} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import axios from 'axios';

import metamask from '../pictures/metamask.png';
import carFabric from '../abi/СarFabric.json';

import '../App.css';
import {injectedConnector} from "../ConnectorParams";
import {useWeb3React} from "@web3-react/core";
import {contractAddress} from "../config";


const useStyles = makeStyles((theme = useTheme()) => ({
    paper: {
        marginTop: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(1, 0, 1),
    },
}));

const CheckoutPage = () => {
    let history = useHistory();
    const [disableState, setDisableState] = useState(false);
    const [DocumentParams, setDocumentParams] = useState({
        "name": '',
        "description": '',
        "image": ''
    });
    const [carImage, setDocumentImage] = useState('');
    const [DocumentValueId, setDocumentValueId] = useState('');
    const {library, activate, active} = useWeb3React();
    const classes = useStyles();

    const buyPageLink = (e) => {
        e.preventDefault();
        history.push({
            pathname: `/`
        })
    }
    const connectToMetamask = () => {
        activate(injectedConnector)
    }
    const handleSearch = async (e) => {
        e.preventDefault();
        const contract = new ethers.Contract(contractAddress, carFabric, library);
        try{
        const URI = await contract.tokenURI(DocumentValueId);
        axios.get(URI)
            .then(res => {
                setDocumentParams(res.data);
            })
        }catch(e){ alert('There is no Document with such id') }
    }
    useEffect(()=>{
        if(DocumentParams.image){
            axios.get(DocumentParams.image)
                .then(res => {
                    setDocumentImage(res.data);
                })
        }
    },[DocumentParams]);
    useEffect( () => {
        const activateAuthorised = async() =>{
            const authorization = await injectedConnector.isAuthorized()
            if (authorization) {
                activate(injectedConnector)
                setDisableState(false)
            } else {
                setDisableState(true)
            }
        }
        activateAuthorised()
    }, [active])

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline/>
            <div className={classes.paper}>
                {(disableState) && <div>
                    <Typography component="h1" variant="h5" >
                        Connect to MetaMask to see Document
                    </Typography>
                    <img src={metamask} alt ="Metamask logo" className='metamask' onClick={connectToMetamask}/>
                </div>}
                {!disableState && <div>
                <Typography component="h1" variant="h4" style = {{marginTop:"45px", textAlign:"center"}}>
                    Input your Document id
                </Typography>
                <form onSubmit={handleSearch} className="Search">
                    <TextField fullWidth variant="outlined" margin="normal" value={DocumentValueId}
                               onChange={e => setDocumentValueId(e.target.value)}
                               className={'text-input-field'}/>
                    <Button
                        fullWidth
                        className={classes.submit}
                        disabled={disableState}
                        color="primary"
                        variant="contained"
                        type="submit">
                        Find your Document
                    </Button>
                </form>
                </div>}
                {DocumentParams.description && !disableState && <div>
                    <Typography component="h1" variant="h5" style = {{textAlign:"center"}}>
                        {DocumentParams.name}
                    </Typography>
                    <img src={carImage} alt="Selected car" className='hummerImage'/>
                    <Typography component="h1" variant="h5" >
                        Description: {DocumentParams.description}
                    </Typography>
                    <Typography component="h1" variant="h5" >
                        Speed: {DocumentParams.speed}
                    </Typography>
                </div>}
                <Button
                    fullWidth
                    onClick={buyPageLink}
                    className={classes.submit}
                    color="primary"
                    variant="contained"
                    type="button"
                    style={{marginTop: "50px"}}>
                    Buy page
                </Button>
            </div>
        </Container>
    );
};


export default CheckoutPage;