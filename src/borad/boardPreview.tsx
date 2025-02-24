import { Backdrop, Box, Fade, Modal, Typography } from "@mui/material"
import { useState } from "react";



const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 1200,
    minHeight:800,
    bgcolor: 'background.paper',
    border: '2px solid 000',
    boxShadow: 24,

    p: 4,
};



type Props = {
    boardList: {
        board_title : string,
        board_content : string
    },
    open:boolean,
    onClose :  (value: boolean) => void;
}
const BoardPreview :React.FC<Props>  = ({boardList ,open ,onClose}) =>{    


    return (
    //<Box>
    <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        onClose={onClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
        backdrop: {
            timeout: 500,
        },
        }}
    >
        <Fade in={open}>
            <Box sx={style}>
                <Typography id="transition-modal-description" sx={{ mt: 2 }} dangerouslySetInnerHTML={{__html:boardList.board_content}} />
            </Box>
        </Fade>
    </Modal>
    )

  //</Box>

}



export default BoardPreview