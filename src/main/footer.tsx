// footer.js

import { Box } from "@mui/material";

function Footer() {
    return (
        <div style={{width:'100%', display:'flex' , flexWrap : 'wrap' ,height:'100px'}}>
        <Box className="Footer" style={{width:'100%', display:'flex' , flexWrap : 'wrap' , height:'100px', margin:'auto' ,backgroundColor: '#222222', justifyContent: 'center',verticalAlign: 'middle' ,color:'#ffffff'}}>
            <span >
                <br/>
                <br/>
                © 2025. Ju Jong Min. All rights reserved.
            </span>
        </Box>
        </div>
    )
}

export default Footer;