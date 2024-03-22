import React, { FC, PropsWithChildren, useState, startTransition } from "react";
import { createRoot } from "react-dom/client";
import App from "~/components/App/App";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { theme } from "~/theme";
import axios, { AxiosError } from "axios";
import { Alert, Snackbar } from "@mui/material";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: false, staleTime: Infinity },
  },
});

if (import.meta.env.DEV) {
  const { worker } = await import("./mocks/browser");
  worker.start({ onUnhandledRequest: "bypass" });
}

const SnackErrorWraper: FC<PropsWithChildren> = ({ children }) => {
  const [showSnack, setShowSnack] = useState(false);
  const [snackMessage, setSnackMessage] = useState("test");

  axios.interceptors.response.use(
    (resp) => resp,
    (err) => {
      // console.log({ err });
      // setShowSnack(true);
      let message = (err as Error).message;
      if (err instanceof AxiosError && err.request?.url) {
        const url = new URL(err.request.url).pathname.replace(/^\/dev\//, "");
        console.log({ url });
        const service = url.split("/")[0];
        // console.log({ service });
        if (service === "cart") {
          // startTransition(() => {
          //   setSnackMessage("Cart DB is off currently...");
          //   setShowSnack(true);
          // });
          message = "Cart db is switch off currently...";
        } else if (
          err instanceof AxiosError &&
          err.response?.data?.message
          // err.response.status.toString().startsWith("4")
        ) {
          console.log("data: ", err.response.data);
          message = err.response?.data.message;
          // setSnackMessage(err.response.data.message);
          // setShowSnack(true);
        }
      }
      // if (
      //   err instanceof AxiosError &&
      //   err.response?.data?.message
      //   // err.response.status.toString().startsWith("4")
      // ) {
      //   console.log("data: ", err.response.data);
      //   message = err.response?.data.message;
      //   // setSnackMessage(err.response.data.message);
      //   // setShowSnack(true);
      // }
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
        autoHideDuration={4000}
        onClose={() => {
          setShowSnack(false);
        }}
      >
        <Alert severity="error">{snackMessage}</Alert>
      </Snackbar>
    </>
  );
};

const container = document.getElementById("app");
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <SnackErrorWraper>
            <App />
          </SnackErrorWraper>
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
