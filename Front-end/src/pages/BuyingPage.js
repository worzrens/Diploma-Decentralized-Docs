import React, {useState, useEffect} from 'react';

import {useHistory} from "react-router-dom";
import {useFormik} from 'formik';
import {useWeb3React} from '@web3-react/core'
import Select from 'react-select'
import {ethers} from 'ethers'
import {makeStyles} from '@material-ui/core/styles';
import {useTheme} from '@material-ui/core/styles';
import * as yup from 'yup';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import {
    S3Client,
    PutObjectCommand
}
    from "@aws-sdk/client-s3";

import metamask from '../pictures/metamask.png';
import hummer from '../pictures/hummer.png'
import audi from '../pictures/audi.png'
import jiguli from '../pictures/jiguli.png'
import docFabric from '../abi/СarFabric.json';

import '../App.css';
import {accessKey, contractAddress, secretAccessKey} from "../config";
import {injectedConnector} from "../ConnectorParams";


const validationSchema = yup.object({
    DocumentName: yup
        .string('Enter your doc Name without empty spaces')
        .required('Document name is required'),
    description: yup
        .string('Enter your doc description')
        .required('Description is required'),
});
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

const DocumentsPage = () => {
    let history = useHistory();
    const [disableState, setDisableState] = useState(false);
    const [selectedOption, setSelectedOption] = useState({value: '', label: '', docPath: ''});
    const [contractInfo, setContractInfo] = useState([]);
    const [DocumentIDs, setDocumentIDs] = useState();
    const {library, account, activate, active} = useWeb3React();
    const classes = useStyles();
    const formik = useFormik({
        initialValues: {
            DocumentName: '',
            description: '',
        },
        validationSchema,
        onSubmit: (values) => handleSubmit(values),
    });

    const checkOutPageLink = () => {
        history.push({
            pathname: `/check`
        })
    }
    const handlePicture = (selectedOption) => {
        setSelectedOption(selectedOption)
    }
    const connectToMetamask = () => {
        activate(injectedConnector)
    }

    const handleSearch = async () => {
        try {
            const contract = await new ethers.Contract(contractAddress, docFabric, library);
            const resp = await contract.getTokensByOwner(account);
            await setDocumentIDs(`Your Documents ids are ${resp.toString()}`);
        } catch (e) {
            setDocumentIDs("You dont's have Document")
        }
    }
    const sendToIPFS = async (body, bucket, key) => {
        try {
            console.log(`Putting file "${key}" in bucket`);
            const data = await IPFS.send(
                new PutObjectCommand({
                    Bucket: bucket,
                    Key: key,
                    Body: body,
                })
            );
            console.log(data); // For unit tests.
        } catch (err) {
            return err
        }
        return `https://${IPFS.url}/documents/${key}`;
    }
    const handleSubmit = async (values) => {
        if (values.DocumentName.indexOf(' ') > -1) {
            alert('You have passed empty space in Document name');
            return
        }
        if (!selectedOption.docPath) {
            alert('You have not selected picture');
            return
        }
        const pictureUrl = await sendToIPFS(selectedOption.docPath, 'firstbohdan', `Document${values.DocumentName}img.png`);
        const jsonBody = JSON.stringify({
            "name": values.DocumentName,
            "description": values.description,
            "speed": selectedOption.speed,
            "image": pictureUrl
        });
        const jsonUrl = await sendToIPFS(jsonBody, 'firstbohdan', `Document${values.DocumentName}.json`);
        const signer = await library.getSigner()
        const contract = await new ethers.Contract(contractAddress, docFabric, signer);
        await contract.buy(account, jsonUrl,
            {value: ethers.utils.parseEther(contractInfo[0].toString())});
        getDocumentsInfo();
    }

    const getDocumentsInfo = async () => {
        if (account) {
            try {
                const contract = await new ethers.Contract(contractAddress, docFabric, library);
                const info = await contract.getDocumentData();
                setContractInfo(info)
            } catch (e) {
                console.log(e)
            }
        }
    }
    useEffect(() => {
        getDocumentsInfo()
    }, [library])
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
                {disableState && <div>
                    <Typography component="h1" variant="h5">
                        Connect to MetaMask to buy Document
                    </Typography>
                    <img src={metamask} alt ="Metamask logo" className='metamask' onClick={connectToMetamask}/>
                    <Grid container style={{marginTop: '15px'}}>
                        <Grid item xs>
                            <Link href='https://metamask.io/'>
                                Don't have a MetaMask account?
                            </Link>
                        </Grid>
                    </Grid>
                </div>}
                {!disableState && <div>
                    <Typography component="h1" variant="h4" style={{textAlign: "center"}}>
                        There are {contractInfo[1]} docs left
                    </Typography>
                    <Typography component="h1" variant="h5" style={{marginTop: "25px"}}>
                        {selectedOption.label ?
                            <img src={selectedOption.docPath} alt="Selected doc" className='hummerImage'/> : 'Select picture'}
                    </Typography>
                    <Select className="Select-menu-outer" options={options} onChange={handlePicture}/>
                    <form onSubmit={formik.handleSubmit} className={classes.form}>
                        <TextField
                            fullWidth
                            id="DocumentName"
                            name="DocumentName"
                            label="DocumentName"
                            variant="outlined"
                            margin="normal"
                            value={formik.values.address}
                            onChange={formik.handleChange}
                            error={formik.touched.DocumentName && Boolean(formik.errors.DocumentName)}
                            helperText={formik.touched.DocumentName && formik.errors.DocumentName}
                        />
                        <TextField
                            fullWidth
                            variant="outlined"
                            margin="normal"
                            id="description"
                            name="description"
                            label="Description"
                            type="description"
                            value={formik.values.description}
                            onChange={formik.handleChange}
                            error={formik.touched.description && Boolean(formik.errors.description)}
                            helperText={formik.touched.description && formik.errors.description}
                        />
                        <Button
                            fullWidth
                            className={classes.submit}
                            disabled={disableState}
                            color="primary"
                            variant="contained"
                            type="submit">
                            Buy Document
                        </Button>
                    </form>
                <Button
                    fullWidth
                    onClick={handleSearch}
                    className={classes.submit}
                    disabled={disableState}
                    color="primary"
                    variant="contained"
                    type="button">
                    Find your Document id
                </Button>
                <Typography component="h1" variant="h6">
                    {DocumentIDs && <div>{DocumentIDs}</div>}
                </Typography>
                </div>}
                <Button
                    fullWidth
                    onClick={checkOutPageLink}
                    className={classes.submit}
                    color="primary"
                    variant="contained"
                    type="button"
                    style={{marginTop: "85px"}}>
                    Checkout page
                </Button>
            </div>
        </Container>
    );
};


export default BuyingPage;