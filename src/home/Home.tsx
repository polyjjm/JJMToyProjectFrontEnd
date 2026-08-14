import React, { useRef } from "react";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  Grid,
  Link,
  Paper,
  Typography,
} from "@mui/material";
import {
  BorderColor as BorderColorIcon,
  Person as PersonIcon,
  AddLocation as AddLocationIcon,
  Call as CallIcon,
  AttachEmail as AttachEmailIcon,
  Mode as ModeIcon,
} from "@mui/icons-material";
import backendImage1 from "../img/backend.2f24287c.svg";
import backendImage2 from "../img/dev-ops.bba7bfe0.svg";
import backendImage3 from "../img/frontend.cc822109.svg";
import backendImage4 from "../img/language.112e0b13.svg";
import { PERSONAL_INFO } from "../common/personalInfo";
import { COLORS } from "../theme";
import './Home.css';
interface HomeProps {
  scrollRef0: React.RefObject<HTMLDivElement>;
  scrollRef1: React.RefObject<HTMLDivElement>;
  scrollRef2: React.RefObject<HTMLDivElement>;
  scrollRef3: React.RefObject<HTMLDivElement>;
}

export const Home: React.FC<HomeProps> = ({ scrollRef0, scrollRef1, scrollRef2, scrollRef3 }) => {
  return (
    <Box sx={{ width: "100%" }}>
      {/* Main Image */}
      <Box id="main-image" display="flex" justifyContent="center" alignItems="center" sx={{ height: { xs: 320, sm: 420, md: 500 }, textAlign: "center", px: 2 }}>
        <Box>
          <Typography sx={{ fontSize: { xs: '2rem', sm: '3rem', md: '3.75rem' } }}><span style={{color:'#fff'}}>-{PERSONAL_INFO.name}-</span></Typography>
          <Typography sx={{ fontSize: { xs: '1.1rem', sm: '1.5rem', md: '2.125rem' } }}><span style={{color:'#fff'}}>웹개발 포트폴리오 사이트입니다</span></Typography>
          <Typography mt={4} sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}><span style={{color:'#fff'}}>안녕하세요<br />새로운 것을 탐구하는 풀스택 개발자<br />{PERSONAL_INFO.name}입니다.</span></Typography>
        </Box>
      </Box>

      {/* About Me */}
      <Box ref={scrollRef0} sx={{ py: 6, px: 2, overflow: 'hidden' }}>
            <Typography variant="h4" textAlign="center" mb={4}>
                <BorderColorIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                ABOUT ME
            </Typography>
            <Grid container spacing={4} justifyContent="center" maxWidth="lg" margin="0 auto">
                {[
                { icon: <PersonIcon />, label: '이름', value: PERSONAL_INFO.name },
                { icon: <AddLocationIcon />, label: '위치', value: PERSONAL_INFO.location },
                { icon: <CallIcon />, label: '연락처', value: PERSONAL_INFO.phone },
                { icon: <AttachEmailIcon />, label: '이메일', value: PERSONAL_INFO.email },
                { icon: <ModeIcon />, label: '학력', value: PERSONAL_INFO.education },
                ].map((item, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                    <Box display="flex" alignItems="center">
                    {item.icon}
                    <Typography ml={1} sx={{ wordBreak: 'keep-all' }}>
                        <strong>{item.label}:</strong> {item.value}
                    </Typography>
                    </Box>
                </Grid>
                ))}
            </Grid>
        </Box>

      {/* Skills */}
      <Box ref={scrollRef1} sx={{ py: 6, px: 2, bgcolor: COLORS.accentSoft }}>
        <Typography variant="h4" textAlign="center" mb={4} sx={{ color: COLORS.textPrimary }}><BorderColorIcon /> SKILLS</Typography>
        <Grid container justifyContent="center">
          <Grid item xs={12} md={10}>
            <Paper sx={{ p: { xs: 2, sm: 4 }, borderRadius: 4, bgcolor: COLORS.surface }}>
              {[{
                title: "FrontEnd",
                icon: backendImage3,
                skills: ["JavaScript", "Vue", "React", "TypeScript"]
              }, {
                title: "BackEnd",
                icon: backendImage4,
                skills: ["Java", "SpringBoot", "Spring"]
              }, {
                title: "DevOps",
                icon: backendImage2,
                skills: ["AWS", "Docker"]
              }, {
                title: "DB",
                icon: backendImage1,
                skills: ["Oracle", "MariaDB", "MySQL"]
              }].map((section, idx) => (
                <Box key={idx} mb={2} sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 1 }}>
                    <img src={section.icon} style={{ width: 40 }} alt="icon" />
                    <Typography fontWeight={600}>{section.title}</Typography>
                  </Box>
                  {section.skills.map(skill => (
                    <Chip key={skill} label={skill} sx={{ fontSize: '15px', backgroundColor: COLORS.accentSoft, color: COLORS.accent }} />
                  ))}
                </Box>
              ))}
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Career */}
      <Box sx={{ py: 6, px: 2, bgcolor: COLORS.accent, color: "#fff" }}>
        <Typography variant="h4" textAlign="center" mb={4}><BorderColorIcon /> CAREER</Typography>
        {[{
          title: "사방넷 차세대",
          tech: "Vue, SpringBoot",
          duration: "2020-12-01 ~ 2022-06-01",
          description: "각종 쇼핑몰 API를 연동하고 관리자 페이지를 개발. PHP 구 코드를 Vue로 컨버전."
        }, {
          title: "우체국 차세대",
          tech: "웹스퀘어, Spring",
          duration: "2022-07-01 ~ 2022-10-01",
          description: "보험 배치 프로그램 및 화면 개발. 정확성과 정합성 중심의 업무 수행."
        }, {
          title: "LG유플러스 차세대",
          tech: "웹스퀘어, SpringBoot",
          duration: "2022-11-01 ~ 2023-07-01",
          description: "소호 인터넷 관련 화면 개발 및 마이그레이션. 타부서와의 협업 중시."
        }].map((job, idx) => (
          <Paper key={idx} sx={{ p: { xs: 2, sm: 4 }, mx: "auto", my: 2, maxWidth: 1000, borderRadius: 4, bgcolor: COLORS.surface, color: COLORS.textPrimary, borderLeft: `4px solid ${COLORS.accent}` }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={9}>
                <Typography variant="h6">{job.title}</Typography>
                <Typography variant="body2">사용기술: {job.tech}</Typography>
                <Typography variant="body2">업무내용: {job.description}</Typography>
              </Grid>
              <Grid item xs={12} md={3} textAlign={{ xs: "left", md: "right" }}>
                <Typography variant="body2">{job.duration}</Typography>
              </Grid>
            </Grid>
          </Paper>
        ))}
      </Box>

      {/* Archiving */}
      <Box ref={scrollRef3} sx={{ py: 6, px: 2, bgcolor: COLORS.bg }}>
        <Typography variant="h4" textAlign="center" mb={4}><BorderColorIcon /> ARCHIVING</Typography>
        <Grid container justifyContent="center">
          <Grid item>
            <Card sx={{ maxWidth: 345, borderRadius: 4 }}>
              <Link href={PERSONAL_INFO.githubUrl} target="_blank" underline="none">
                <CardActionArea>
                  <CardMedia component="img" height="140" image={process.env.PUBLIC_URL + '/gitHub.png'} alt="GitHub" />
                  <CardContent>
                    <Typography variant="h6">{PERSONAL_INFO.githubUrl}</Typography>
                  </CardContent>
                </CardActionArea>
              </Link>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};