import ScannerIcon from "@mui/icons-material/DocumentScanner";
import styles from "@/styles/DocumentsPage.module.css";
import { Typography } from "@mui/material";

export default function Page() {
  return (
    <div className={styles.pageWrapper}>
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
      </article>
    </div>
  );
}
