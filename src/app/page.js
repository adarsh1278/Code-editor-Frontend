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
import { VscFile } from "react-icons/vsc";
function App() {
  //context
  const [flagwrite ,setFlagwrite] = useState(true)
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
  //useeffect to check whether a file selected or not
  useEffect( ()=>{
   
  


      const fetchFileContent = async () => {
        if (file) {
          setFlagwrite(true);
          // Fetch file data
          const response = await fetch(`http://localhost:9000/files/content?path=${file}`);
          const result = await response.json();
          setSelectedFileContent(result.content);
          setFlagwrite(false);
        }
      };
      fetchFileContent();
      
     //fetch file data 
    
    
  },[file])
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
      `http://localhost:9000/files/content?path=${file}`
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
    <div className=" h-screen w-screen bg-slate-400">

      <div className=" flex flex-row">
        <div className=" bg-slate-900 w-1/6 h-screen   p-3 " >
        <Folder
       
            handleInsertNode={handleInsertNode}
            handleDeleteNode={handleDeleteNode}
            handleUpdateFolder={handleUpdateFolder}
            explorerData={explorerData}
          />
        </div>
        <div className="bg-blue-600 w-full h-screen flex flex-col">
        <div className=" h-10  w-full  p-3 bg-gray-800  text-yellow-50 font-extrabold font-serif"><VscFile/><span className=" pb-3 ml-3">{file? file:"pls select a file"}</span></div>
        <div className=" bg-slate-300 h-fit w-fit">
        <AceEditor 
       readOnly={flagwrite}
        mode="js"
         value={code}
         width="1500px"
         height="600px"
         fontSize={24}
        theme="solarized dark"
         editorProps={{ $blockScrolling: true }}
          onChange={(e) => setCode(e)} />
       
        </div>
        <div  className=" h-full w-full">
        <Terminal/>
        </div>
        </div>
      </div>

    </div>
    </>
  );
}

export default App;
