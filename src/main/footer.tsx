import { Box, Typography } from "@mui/material";

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        width: '100%',
        height: { xs: '80px', sm: '100px' },
        backgroundColor: '#222222',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        textAlign: 'center',
        fontSize: { xs: '12px', sm: '14px' },
        mt: 4,
      }}
    >
      <Typography variant="body2" component="p">
        © 2025. Ju Jong Min. All rights reserved.
      </Typography>
    </Box>
  );
}

export default Footer;