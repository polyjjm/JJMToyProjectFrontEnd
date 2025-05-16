import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';

interface SkeletonCardProps {
  loading?: boolean;
}

export default function BoardSkeleton({ loading = true }: SkeletonCardProps) {
  return (
    <Card
      sx={{
        width: '100%',
        maxWidth: 600,
        minHeight: 200,
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        p: 2,
        mb: 2,
      }}
    >
      {/* 이미지 스켈레톤 */}
      <Skeleton
        variant="rectangular"
        width={150}
        height={150}
        sx={{
          flexShrink: 0,
          borderRadius: 1,
          mr: { sm: 2 },
          mb: { xs: 2, sm: 0 },
        }}
      />

      <CardContent sx={{ flex: 1, p: 0 }}>
        {/* 제목 */}
        <Skeleton animation="wave" height={24} width="80%" sx={{ mb: 1 }} />
        {/* 썸네일 텍스트 */}
        <Skeleton animation="wave" height={16} width="100%" />
        <Skeleton animation="wave" height={16} width="90%" sx={{ mt: 0.5 }} />

        {/* 해시태그 */}
        <Box mt={1} display="flex" gap={1}>
          <Skeleton variant="rounded" width={50} height={20} />
          <Skeleton variant="rounded" width={50} height={20} />
          <Skeleton variant="rounded" width={50} height={20} />
        </Box>

        {/* 날짜 및 아이콘 */}
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ pt: 2 }}>
          <Skeleton variant="text" width={100} height={16} />
          <Box display="flex" gap={2}>
            <Skeleton variant="circular" width={20} height={20} />
            <Skeleton variant="circular" width={20} height={20} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}