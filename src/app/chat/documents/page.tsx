"use client";

import { useEffect, useState } from "react";
import { useFilePicker } from "use-file-picker";
import ScannerIcon from "@mui/icons-material/DocumentScanner";
import styles from "@/styles/DocumentsPage.module.css";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Dialog,
  DialogContent,
  DialogContentText,
  Grid,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import { getAuthenticatedUser } from "@/util/requests/getAuthenticatedUser";
import { useRouter } from "next/navigation";
import {
  UserDocument,
  getDocumentsOwnedByUser,
} from "@/util/requests/getDocumentsOwnedByUser";
import { useIncludedDocuments } from "@/hooks/useIncludedDocuments";
import {
  FileAmountLimitValidator,
  FileSizeValidator,
} from "use-file-picker/validators";
import { uploadPdfDocument } from "@/util/requests/uploadPdfDocument";

export default function Page() {
  const router = useRouter();

  const [alert, setAlert] = useState("");
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const { includedDocuments, setIncludedDocuments } = useIncludedDocuments();
  const { openFilePicker } = useFilePicker({
    accept: ".pdf",
    validators: [
      new FileAmountLimitValidator({ max: 1 }),
      new FileSizeValidator({ maxFileSize: 5 * 1024 * 1024 /* 5 megabytes */ }),
    ],
    onFilesRejected: ({ errors }) => {
      console.log(errors);
      setAlert("File is too big. We have a 5 Mb limit.");
    },
    onFilesSuccessfullySelected: ({ plainFiles, filesContent }: any) => {
      // this callback is called when there were no validation errors
      console.log("onFilesSuccessfullySelected", plainFiles, filesContent);
      uploadPdfDocument(filesContent[0]);
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        await getAuthenticatedUser();
        setDocuments((await getDocumentsOwnedByUser()) as any);
      } catch (e) {
        console.log(e);
        router.push("/login");
      }
    };

    fetchData();
  }, []);

  return (
    <div className={styles.pageWrapper}>
      <Dialog open={!!alert} onClose={() => setAlert("")}>
        <DialogContent>
          <DialogContentText>{alert}</DialogContentText>
        </DialogContent>
      </Dialog>
      <article>
        <div className={styles.alignIconWithinCenteredTitle}>
          <ScannerIcon />
          <Typography
            variant="h1"
            style={{ fontSize: "24px", marginLeft: "8px" }}
          >
            Your Documents
          </Typography>
        </div>
        <Typography paragraph textAlign={"center"}>
          Upload documents to chat with them.
        </Typography>
        <Typography paragraph textAlign={"center"}>
          Please refresh the page to see documents you just uploaded. It can
          take a few minutes to process new documents.
        </Typography>
        <Box textAlign="center">
          <Button
            variant="contained"
            onClick={() => {
              openFilePicker();
            }}
          >
            Upload
          </Button>
        </Box>
      </article>
      <Grid container spacing={4} columns={4}>
        {documents.map((document) => (
          <Grid item key={document.uid} style={{ width: "25%" }}>
            <Card>
              <CardContent>{document.name}</CardContent>
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
                        setIncludedDocuments(
                          includedDocuments.concat([document.uid])
                        );
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
                      console.log("Delete");
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
    </div>
  );
}
