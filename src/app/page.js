"use client"
import { useCallback, useContext, useEffect, useState } from "react";
import Terminal from "@/component/terminal";
import FileTree from "@/component/tree";
import socket from "@/component/socket";
import AceEditor from "react-ace";
import Folder from "@/component/Folder";
import useTraverseTree from "@/hooks/use-traverse-tree";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools";
import { MyContext } from "@/context/contextProvider";
function App() {
  //context
  const {file , setFile} = useContext(MyContext)
  const [fileTree, setFileTree] = useState({});
  const [selectedFile, setSelectedFile] = useState("");
  const [selectedFileContent, setSelectedFileContent] = useState("");
  const [code, setCode] = useState("");
  const [folderData , setFolderData] = useState("")
  const [explorerData, setExplorerData] = useState(folderData);
  const { insertNode, deleteNode, updateNode } = useTraverseTree();
  const handleInsertNode = (folderId, itemName, isFolder) => {
    const finalItem = insertNode(explorerData, folderId, itemName, isFolder);
    return finalItem;
  };
  const handleDeleteNode = (folderId) => {
    // Call deleteNode to get the modified tree
    const finalItem = deleteNode(explorerData, folderId);
    // Update the explorerData state with the modified tree
    setExplorerData(finalItem);
  };

  const handleUpdateFolder = (id, updatedValue, isFolder) => {
    const finalItem = updateNode(explorerData, id, updatedValue, isFolder);
    // Update the explorerData state with the modified tree
    setExplorerData(finalItem);
  };
  const isSaved = selectedFileContent === code;

  useEffect(() => {
    if (!isSaved && code) {
      const timer = setTimeout(() => {
        socket.emit("file:change", {
          path: file,
          content: code,
        });
      }, 1000);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [code, selectedFile, isSaved]);

  useEffect(() => {
    setCode("");
  }, [selectedFile]);

  useEffect(() => {
    setCode(selectedFileContent);
  }, [selectedFileContent]);
  function generateRandomId() {
    return Math.floor(Math.random() * 100000).toString();
  }
  function convertToFolderData(node) {
    const isFolder = node.type === "directory";
    const path = node.path
    const items = isFolder
      ? node.children.map(child => convertToFolderData(child))
      : [];
  
    return {
      id: generateRandomId(),
      name: node.name,
      isFolder,
      items,
      path,
      
    };
  }
  
  const getFileTree = useCallback(async () => {
    const response = await fetch("http://localhost:9000/files");
    console.log(response)
    const result = await response.json();
   


    console.log("result34")

    console.log(result.tree)
    let a = convertToFolderData(result.tree)
    console.log("resultof folder data")
    setFolderData(a)
    setExplorerData(a)
    console.log(a)
   
    // setFileTree(result.tree);
  }, []);

  useEffect(() => {
    getFileTree();
  }, [getFileTree]);

  const getFileContents = useCallback(async () => {
    if (!selectedFile) return;
    const response = await fetch(
      `http://localhost:9000/files/content?path=${selectedFile}`
    );
    const result = await response.json();
    setSelectedFileContent(result.content);
  }, [selectedFile]);

  useEffect(() => {
    if (selectedFile) getFileContents();
  }, [getFileContents, selectedFile]);

  useEffect(() => {
    socket.on("file:refresh", getFileTree);

    return () => {
      socket.off("file:refresh", getFileTree);
    };
  }, [getFileTree]);

  return (
    // <div className="playground-container">
    //   <div className="editor-container">
    //     <div className="files">
    //       <FileTree
    //         onSelect={(path) => {
    //           setSelectedFileContent("");
    //           setSelectedFile(path);
    //         }}
    //         tree={fileTree}
    //       />
    //     </div>
    //     <div className="editor">
    //       {selectedFile && (
    //         <p>
    //           {selectedFile.replaceAll("/", " > ")}{" "}
    //           {isSaved ? "Saved" : "Unsaved"}
    //         </p>
    //       )}
    //       <AceEditor value={code} onChange={(e) => setCode(e)} />
    //     </div>
    //   </div>
    //   <div className="terminal-container">
    //     <Terminal />
    //   </div>
    // </div>
    <>
     <div className="App">
      <div className="folderContainerBody">
        <div className="folder-container">
          <Folder
            handleInsertNode={handleInsertNode}
            handleDeleteNode={handleDeleteNode}
            handleUpdateFolder={handleUpdateFolder}
            explorerData={explorerData}
          />
        </div>
        <div className="empty-state bg-white text-blue-500">
        <div className=" w-full flex flex-col  h-full ">
        <div className=" bg-red-800  h-2/3 w-full">
        <AceEditor value={code} onChange={(e) => setCode(e)} />
          </div>
          <div className="">
            <Terminal></Terminal>
          </div>
        </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default App;
