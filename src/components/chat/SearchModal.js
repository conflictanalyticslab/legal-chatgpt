import React from 'react';
import { Button, Typography, Modal, Box } from '@mui/material';
import SearchPage from './SearchPage';
import SearchIcon from "../../images/search-icon.png"

const style = {
    position: 'absolute', 
    top: '50%', 
    left: '50%', 
    width: '85%', 
    height: '85%',
    transform: 'translate(-50%, -50%)', 
    backgroundColor: 'background.paper', 
    border: '2px solid #000', 
    boxShadow: 24, 
    p: 4
};

const SearchModal = ({wasSearched, setSearchTerm}) => {
    const [modalOpen, setmodalOpen] = React.useState(false);
    const handleOpen = () => setmodalOpen(true);
    const handleClose = () => setmodalOpen(false);

    return (
        <div
            style={{
                width: '20%',
                marginLeft: 'auto',
                paddingTop: '25px',
            }}
        >
            <Button sx={{
                display: "flex",
                borderRadius: '10px',
                border: "2px solid rgb(218, 226, 237)",
                cursor: "pointer",
                width: '17rem',
                height: '2.5rem',
                
            }}
                onClick={handleOpen}
            >
                <img src={SearchIcon} style={{width: '14px', height: '14px', marginRight: 'auto'}}/>
                <Typography style= {{marginRight: 'auto'}}>Search ... </Typography>
            </Button>
            <Modal
                open = {modalOpen}
                onClose={handleClose}
            >
                    <Box sx = {style}>
                        <SearchPage
                        wasSearched={wasSearched}
                        setSearchTerm={setSearchTerm}
                    ></SearchPage>
                    </Box>
            </Modal>
        </div>
    );
};

export default SearchModal;