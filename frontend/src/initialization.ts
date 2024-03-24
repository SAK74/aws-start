if (import.meta.env.DEV) {
  const { worker } = await import("./mocks/browser");
  worker.start({ onUnhandledRequest: "bypass" });
}

// temporary, for demo
localStorage.setItem("authorization_token", "U0FLNzQ6VEVTVF9QQVNTV09SRA==");
