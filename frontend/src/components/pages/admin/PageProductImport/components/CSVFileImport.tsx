import React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import axios, { AxiosError, AxiosRequestHeaders, ResponseType } from "axios";
import SnackBar from "@mui/material/Snackbar";
import Alert, { AlertColor } from "@mui/material/Alert";

type CSVFileImportProps = {
  url: string;
  title: string;
};

export default function CSVFileImport({ url, title }: CSVFileImportProps) {
  const [file, setFile] = React.useState<File>();

  const [openSnackBar, setOpenSnackBar] = React.useState<boolean>(false);
  const [alertMessage, setAllertMessage] = React.useState<string>("");
  const [alertType, setAlertType] = React.useState<AlertColor | undefined>();

  const setMessage = React.useCallback(
    (type: AlertColor, message: string) => {
      setOpenSnackBar(true);
      setAlertType(type);
      setAllertMessage(message);
    },
    [setOpenSnackBar, setAlertType, setAllertMessage]
  );

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setFile(file);
    }
  };

  const removeFile = () => {
    setFile(undefined);
  };

  const uploadFile = async () => {
    console.log("uploadFile to", url);

    if (!file) {
      console.error("No file selected...!");
      return;
    }

    try {
      // Get the presigned URL
      const authToken = localStorage.getItem("authorization_token");
      const headers: AxiosRequestHeaders = {};
      if (authToken) {
        headers.Authorization = `Basic ${authToken}`;
      }
      const response = await axios({
        method: "GET",
        url,
        params: {
          name: encodeURIComponent(file.name),
        },
        headers,
      });
      console.log("File to upload: ", file.name);
      console.log("Uploading to: ", response.data);

      const result = await fetch(response.data, {
        method: "PUT",
        body: file,
      });
      console.log("Result: ", result);
      if (result.ok) {
        setFile(undefined);
        setMessage("success", "Upload success!");
      }
    } catch (err) {
      console.log("Error: ", err);
      let message = (err as Error).message;
      if (err instanceof AxiosError) {
        if (err.response && err.response.status.toString().startsWith("4")) {
          message += "\n" + err.response.data?.message;
        }
        setMessage("error", message);
      }
    }
  };

  const handleClose = () => {
    setOpenSnackBar(false);
  };

  return (
    <>
      <Box>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        {!file ? (
          <input type="file" onChange={onFileChange} />
        ) : (
          <div>
            <button onClick={removeFile}>Remove file</button>
            <button onClick={uploadFile}>Upload file</button>
          </div>
        )}
      </Box>
      <SnackBar
        open={openSnackBar}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        autoHideDuration={5000}
      >
        <Alert
          severity={alertType}
          children={alertMessage}
          onClose={handleClose}
        />
      </SnackBar>
    </>
  );
}
