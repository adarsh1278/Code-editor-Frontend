import { Terminal as XTerminal } from "@xterm/xterm";
import { useEffect, useRef } from "react";
import socket from "./socket";

import "@xterm/xterm/css/xterm.css";

const Terminal = () => {
  const terminalRef = useRef();
  const isRendered = useRef(false);

  useEffect(() => {
    if (isRendered.current) return;
    isRendered.current = true;

    const term = new XTerminal({
      theme: {
        background: '#020E2E', // Set background to blue
        foreground: '#F4F4ED', // Set text color to white
        cursor: '#FFFFFF',     // Set cursor color to red
        selection: '#888888',  // Set selection color
      },
      rows: 14,
    });

    term.open(terminalRef.current);

    term.onData((data) => {
      socket.emit("terminal:write", data);
    });

    function onTerminalData(data) {
      term.write(data);
    }

    socket.on("terminal:data", onTerminalData);
  }, []);

  return <div   ref={terminalRef} id="terminal" />;
};

export default Terminal;