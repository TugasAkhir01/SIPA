import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, Button } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';

const MAX_FILE_SIZE_MB = 10;

const FileUpload = ({ type = 'hasil', onUploaded }) => {
    const [preview, setPreview] = useState(null);
    const [, setError] = useState('');
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');

    const onDrop = useCallback(async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;

        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            setError('Ukuran file maksimal 10MB');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await axios.post(`https://sippak-be.up.railway.app/api/violations/upload?type=${type}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });

            const isImage = file.type.startsWith('image/');
            if (isImage) {
                const imgUrl = URL.createObjectURL(file);
                setPreview({ type: 'image', url: imgUrl });
            } else {
                setPreview({ type: 'document', name: file.name });
            }

            if (onUploaded) onUploaded(res.data);
        } catch (error) {
            console.error('Upload gagal:', error);
            setError('Gagal mengunggah file');
        }
    }, [type, onUploaded, token]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    return (
        <>
            <Box
                {...getRootProps()}
                sx={{
                    width: 400,
                    height: 260,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    p: 8,
                    m: 'auto',
                    cursor: 'pointer'
                }}
            >
                <input {...getInputProps()} />
                <CloudUploadIcon sx={{ fontSize: 48, color: '#888' }} />
                <Typography variant="body1" mt={1}>
                    {isDragActive ? "Lepaskan file di sini..." : "Tarik dan lepaskan file di sini"}
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                    atau
                </Typography>
                <Button
                    variant="contained"
                    sx={{
                        mt: 1,
                        bgcolor: '#000',
                        textTransform: 'none',
                        '&:hover': { bgcolor: '#333' }
                    }}
                >
                    Browse Files
                </Button>
                <Typography variant="caption" color="text.secondary" mt={2}>
                    Format: PDF, DOC, DOCX, TXT, JPG, PNG (Max: 10MB)
                </Typography>
            </Box>

            {preview && (
                <Box mt={2} textAlign="center">
                    {preview.type === 'image' ? (
                        <img
                            src={preview.url}
                            alt="Preview"
                            style={{ width: 200, height: 'auto', borderRadius: 8, marginTop: 8 }}
                        />
                    ) : (
                        <Typography variant="body2" mt={2}>
                            Dokumen: <strong>{preview.name}</strong>
                        </Typography>
                    )}
                </Box>
            )}
        </>
    );
};

export default FileUpload;
