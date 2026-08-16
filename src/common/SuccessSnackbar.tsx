import { Alert, Snackbar } from "@mui/material";

interface SuccessSnackbarProps {
    open: boolean;
    message: string;
    onClose: () => void;
}

// Reusable success confirmation toast - MUI's Snackbar/Alert, no new dependency needed. Used
// after board insert/update today; safe to reuse anywhere else a "this succeeded" confirmation
// is wanted instead of the page just silently moving on.
export default function SuccessSnackbar({ open, message, onClose }: SuccessSnackbarProps) {
    return (
        <Snackbar
            open={open}
            autoHideDuration={2000}
            onClose={onClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
            <Alert severity="success" variant="filled" onClose={onClose} sx={{ fontWeight: 600 }}>
                {message}
            </Alert>
        </Snackbar>
    );
}
