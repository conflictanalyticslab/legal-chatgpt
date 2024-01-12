import { useState, useRef } from "react";
import Modal from '@mui/material/Modal';
import Image from "next/image";
import DocsImg from "../../images/doc_img.jpeg";
import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Grid,
    IconButton,
    TextField,
    Tooltip,
    Typography
} from "@mui/material";
import {
    UserDocument,
    getDocumentsOwnedByUser,
} from "@/util/requests/getDocumentsOwnedByUser";
// import { useIncludedDocuments } from "@/hooks/useIncludedDocuments"; // passing props instead
import { editDocument } from "@/util/api/editDocument";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import { stringify } from "querystring";
import { set } from "firebase/database";

type Props = {
    documents: UserDocument[];
    deleteDocument: (uid: string) => void;
    currentInput: string;
    setCurrentInput: React.Dispatch<React.SetStateAction<string>>;
    includedDocuments: string[];
    setIncludedDocuments: React.Dispatch<React.SetStateAction<string[]>>;
};

const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: "85%",
    height: "85%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
    overflow: "scroll",
    overflowY: "auto",
};

export default function PDFModal({ documents, deleteDocument, currentInput, setCurrentInput, includedDocuments, setIncludedDocuments }: Props) {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [editing, setEditing] = useState("");
  const textFieldRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState("");
  const cardContentRef = useRef<HTMLDivElement>(null);
  

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setDocuments((await getDocumentsOwnedByUser()) as any);
//       } catch (e) {
//         console.log(e);
//       }
//     };

//     fetchData();
//   }, []);

  return (
    <div
      style={{
        width: "20%",
        marginRight: "3rem",
        paddingTop: "25px",
      }}
    >
      <Button
        sx={{
          display: "flex",
          borderRadius: "10px",
          border: "2px solid rgb(218, 226, 237)",
          cursor: "pointer",
          width: "17rem",
          height: "2.5rem",
        }}
        onClick={handleOpen}
      >
        <Image
          src={DocsImg}
          style={{ width: "16px", height: "22px", marginRight: "auto" }}
          alt={""}
        />
        <Typography style={{ marginRight: "auto" }}>PDFs</Typography>
      </Button>
      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
        <Typography style={{ justifyContent: "center", marginBottom: "3rem" }} variant="h6" component="h2">Uploaded PDFs</Typography>
        {editing == "" ? (
        <Grid container spacing={4} columns={4}>
            {documents.map((document) => (
            <Grid item key={document.uid} style={{ width: "25%" }}>
                <Card>
                <CardContent>{document.name}</CardContent>
                <CardContent >{document.text.length > 180 ? (document.text.substring(0, 177) + "...") : document.text}</CardContent>
                <CardActions>
                    <Tooltip title="Include in conversation">
                    <IconButton
                        key="include-document"
                        onClick={() => {
                        if (includedDocuments.includes(document.uid)) {
                            setCurrentInput(currentInput.replace(document.text, ""))
                            setIncludedDocuments(
                            includedDocuments.filter(
                                (docUid: string) => docUid != document.uid
                            )
                            );
                        } else {
                            setCurrentInput(currentInput + " " + document.text);
                            setIncludedDocuments([
                            ...includedDocuments,
                            document.uid,
                            ]);
                        }
                        }}
                        style={{ color: "#006400" }}
                    >
                        {includedDocuments.includes(document.uid) ? (
                        <CheckBoxIcon />
                        ) : (
                        <CheckBoxOutlineIcon />
                        )}
                    </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit document text">
                    <IconButton
                        key="edit-document"
                        onClick={() => {
                          setEditing(document.uid);
                          setInputValue(document.text);
                          if (textFieldRef.current) {
                            textFieldRef.current.focus();
                          }
                        }}
                        style={{ color: "#000" }}
                    >
                        <EditIcon />
                    </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete document">
                    <IconButton
                        key="delete-document"
                        onClick={() => {
                        console.log("Delete" + document.name);
                        deleteDocument(document.uid);
                        }}
                        style={{ marginRight: "8px", color: "#f33" }}
                    >
                        <DeleteIcon />
                    </IconButton>
                    </Tooltip>
                </CardActions>
                </Card>
            </Grid>
            ))}
        </Grid>
        ) : (
          <Grid container spacing={4}>
    <Grid item xs={3}>
        <Grid container spacing={4} alignItems="flex-start">
            {documents.map((document) => (
            <Grid item key={document.uid} xs={12}>
                <Card>
                <CardContent>{document.name}</CardContent>
                <CardContent>{document.text.length > 180 ? (document.text.substring(0, 177) + "...") : document.text}</CardContent>
                <CardActions>
                    <Tooltip title="Include in conversation">
                    <IconButton
                        key="include-document"
                        onClick={() => {
                        if (includedDocuments.includes(document.uid)) {
                            setCurrentInput(currentInput.replace(document.text, ""))
                            setIncludedDocuments(
                            includedDocuments.filter(
                                (docUid: string) => docUid != document.uid
                            )
                            );
                        } else {
                            setCurrentInput(currentInput + " " + document.text);
                            setIncludedDocuments([
                            ...includedDocuments,
                            document.uid,
                            ]);
                        }
                        }}
                        style={{ color: "#006400" }}
                    >
                        {includedDocuments.includes(document.uid) ? (
                        <CheckBoxIcon />
                        ) : (
                        <CheckBoxOutlineIcon />
                        )}
                    </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit document text">
                    <IconButton
                        key="edit-document"
                        onClick={() => {
                        setEditing(document.uid);
                        setInputValue(document.text);
                        if (textFieldRef.current) {
                          textFieldRef.current.focus();
                        }
                        }}
                        style={{ color: "#000" }}
                    >
                        <EditIcon />
                    </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete document">
                    <IconButton
                        key="delete-document"
                        onClick={() => {
                        console.log("Delete" + document.name);
                        deleteDocument(document.uid);
                        }}
                        style={{ marginRight: "8px", color: "#f33" }}
                    >
                        <DeleteIcon />
                    </IconButton>
                    </Tooltip>
                </CardActions>
                </Card>
            </Grid>
            ))}
        </Grid>
    </Grid>
    <Grid item xs={9}>
        <TextField 
            fullWidth 
            multiline 
            variant="outlined" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            inputRef={textFieldRef}
        />
        <Button
          variant="contained"
          sx={{
            width: "160px",
            fontSize: "16px",
            marginTop: "30px",
            color: "white",
            textTransform: "none",
            textDecoration: "none",
            fontWeight: "bold"
          }}
          onClick={() => {
            if (textFieldRef.current && textFieldRef.current.value) {
              try {
                editDocument(editing, textFieldRef.current?.value)
                documents.filter((doc) => doc.uid == editing)[0].text = textFieldRef.current?.value;
                setEditing("");
              } catch (e) {
                console.error("Error editing document: " + e);
              }
            }

          }}
        >
          Done
      </Button>
    </Grid>
</Grid>
        )}
          </Box>
      </Modal>
    </div>
  );
}