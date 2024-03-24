import { Alert, Snackbar, Typography } from "@mui/material";
import axios, { AxiosError } from "axios";
import { FC, PropsWithChildren, startTransition, useState } from "react";

export const SnackErrorWraper: FC<PropsWithChildren> = ({ children }) => {
  const [showSnack, setShowSnack] = useState(false);
  const [snackMessage, setSnackMessage] = useState("test");

  axios.interceptors.response.use(
    (resp) => resp,
    (err) => {
      let message = (err as Error).message;
      if (err instanceof AxiosError) {
        if (err.response) {
          if (err.config.url) {
            const url = new URL(err.config.url).pathname.replace(
              /^\/dev\//,
              ""
            );
            const service = url.split("/")[0];
            if (
              (service === "cart" || service === "order") &&
              err.response.status.toString().startsWith("5")
            ) {
              message = service.toUpperCase() + " DB IS SHUT DOWN CURRENTLY...";
            } else if (err.response.status === 401) {
              message = "You should login to view all functionality!";
            } else if (err.response.status === 403) {
              message = "Wrong credentials!";
            } else {
              message = err.response.data.message;
            }
          }
        }
      }

      startTransition(() => {
        setSnackMessage(message);
        setShowSnack(true);
      });
      return Promise.reject(err);
    }
  );

  return (
    <>
      {children}
      <Snackbar
        open={showSnack}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        autoHideDuration={5000}
        onClose={() => {
          setShowSnack(false);
        }}
      >
        <Alert severity="error" sx={{ alignItems: "center" }}>
          <Typography variant="h5">{snackMessage}</Typography>
        </Alert>
      </Snackbar>
    </>
  );
};
