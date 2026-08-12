import { Box, CircularProgress, Typography } from "@mui/material";
import { postBoardSearch } from "../common/common";
import { useEffect } from "react";

export default function kakoAuth(){

    useEffect(() =>{
        const fetchData = async () => {
            const code = new URL(window.location.href).searchParams.get('code');
            const setValues = {
                code,
                // must match the redirect_uri signin.tsx sent to Kakao's /authorize step
                redirectUri: `${window.location.origin}/login/kakao/oauth`,
            }
            const returnResult = await postBoardSearch('/member/kakao/doLogin', setValues);

            if (!returnResult || !returnResult.token) {
                alert('카카오 로그인에 실패했습니다. 다시 시도해주세요.');
                window.location.href = '/signin';
                return;
            }

            localStorage.setItem("token", returnResult.token)
            localStorage.setItem("user_email", returnResult.id)
            window.location.href = '/';
        };

        fetchData();
    },[])
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 2 }}>
            <CircularProgress />
            <Typography color="text.secondary">로그인 처리중입니다...</Typography>
        </Box>
    )
}
