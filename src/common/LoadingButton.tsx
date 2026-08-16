import { Button, ButtonProps, CircularProgress } from "@mui/material";

interface LoadingButtonProps extends ButtonProps {
    loading?: boolean;
    loadingText?: React.ReactNode;
}

// Reusable spinner+disabled submit button, matching board-insert-mockup.html's
// .btn-primary.loading state. Not board-specific - any POST/PUT triggered by a button click
// can reuse this instead of a one-off spinner so "submitting" looks the same everywhere.
export default function LoadingButton({ loading, loadingText, children, disabled, sx, ...rest }: LoadingButtonProps) {
    return (
        <Button
            disabled={disabled || loading}
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                opacity: loading ? 0.85 : 1,
                cursor: loading ? 'default' : undefined,
                ...sx,
            }}
            {...rest}
        >
            {loading && <CircularProgress size={14} thickness={5} sx={{ color: 'inherit' }} />}
            {loading ? (loadingText ?? children) : children}
        </Button>
    );
}
