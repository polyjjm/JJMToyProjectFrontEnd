import { Box, Paper, Typography } from "@mui/material"
import { COLORS } from "../theme"

export default function signin(){

    const kakaoLogin = () =>{
        // Dynamic so this works from any registered origin (localhost during dev, the
        // production domain when deployed) - the exact URI must be registered in the
        // Kakao Developers console for this app, and is sent to the backend so its
        // token-exchange call uses the same redirect_uri Kakao expects.
        const redirect_uri = `${window.location.origin}/login/kakao/oauth`;
        const client_id = "663f118997d31c1c7c7b2dcce78417b2";

        window.location.href = `https://kauth.kakao.com/oauth/authorize?client_id=${encodeURIComponent(client_id)}&redirect_uri=${encodeURIComponent(redirect_uri)}&response_type=code`;
    }
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', px: 2, py: { xs: 6, sm: 10 } }}>
            <Paper elevation={3} sx={{ width: '100%', maxWidth: 400, p: { xs: 3, sm: 5 }, borderRadius: 4, textAlign: 'center' }}>
                <Typography variant="h4" sx={{ mb: 4, color: COLORS.ink }}>로그인</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <img
                        onClick={() => kakaoLogin()}
                        alt="카카오 로그인"
                        src={process.env.PUBLIC_URL + '/kakao_login.png'}
                        style={{ width: '100%', maxWidth: 300, cursor: 'pointer' }}
                    />
                </Box>
            </Paper>
        </Box>
    )
}
