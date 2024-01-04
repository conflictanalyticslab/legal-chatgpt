import { useState } from "react";
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
    Tooltip,
    Typography,
} from "@mui/material";
import {
    UserDocument,
    getDocumentsOwnedByUser,
} from "@/util/requests/getDocumentsOwnedByUser";
import { useIncludedDocuments } from "@/hooks/useIncludedDocuments";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import { useRouter } from "next/navigation";

type Props = {
    documents: UserDocument[];
    deleteDocument: (uid: string) => void;
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

export default function PDFModal({ documents, deleteDocument }: Props) {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

//   const [documents, setDocuments] = useState<UserDocument[]>([{
//     uid: '1234',
//     name: "DOC1",
//     text: "a aaaaaaaaaa aaaaaaaaaa aaaaaaaaaa a aaaa",
//     userUid: "4321"
//   }, {
//     uid: '2234',
//     name: "DOC2",
//     text: "This is the text of the document",
//     userUid: "4321"}, {
//         uid: '3234',
//         name: "DOC3",
//         text: "This is the text of the document",
//         userUid: "4321"}, {
//             uid: '4234',
//             name: "DOC4",
//             text: "This is the text of the document",
//             userUid: "4321"}]);
  const { includedDocuments, setIncludedDocuments } = useIncludedDocuments();

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
        <Grid container spacing={4} columns={4}>
            {documents.map((document) => (
            <Grid item key={document.uid} style={{ width: "25%" }}>
                <Card>
                <CardContent>{document.name}</CardContent>
                <CardContent>{document.text.length > 180 ? (document.text.substring(0, 177) + "...") : document.text}</CardContent>
                <CardActions>
                    <Tooltip title="Include in conversation">
                    <IconButton
                        key="include-document"
                        onClick={() => {
                        if (includedDocuments.includes(document.uid)) {
                            setIncludedDocuments(
                            includedDocuments.filter(
                                (docUid: string) => docUid != document.uid
                            )
                            );
                        } else {
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
                        console.log("Edit");
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
          </Box>
      </Modal>
    </div>
  );
}