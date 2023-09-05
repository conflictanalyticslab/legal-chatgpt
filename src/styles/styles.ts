"use client";
import { styled } from "@mui/material/styles";
import { Box, Grid, Toolbar, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

export const AppBackground = styled("div")({
  backgroundColor: "#f5f5f7",
  minHeight: "85vh",
});

export const MyToolbar = styled(Toolbar)({
  height: "10vh",
  display: "flex",
  justifyContent: "space-between",
  padding: "0px",
  backgroundColor: "white",
});

export const BlackMenuIcon = styled(MenuIcon)({
  color: "#000",
});

export const Logo = styled("div")({
  color: "blue",
  cursor: "pointer",
});

export const Link = styled("a")({
  color: "#000",
  fontWeight: "bold !important",
  paddingRight: "12px",
});

export const FormContainer = styled("div")(({ theme }) => ({
  flexGrow: 1,
  padding: "10px",
  maxWidth: "700px",
  margin: "30px auto",
  [theme.breakpoints.between("xs", "sm")]: {
    width: "100%",
  },
}));

export const Form = styled("div")({
  marginTop: "30px",
});

export const FormHeading = styled("div")({
  textAlign: "center",
  margin: "30px",
});

export const HeroBox = styled(Box)({
  width: "100%",
  display: "flex",
  minHeight: "600px",
  alignItems: "center",
  justifyContent: "center",
});

export const GridContainer = styled(Grid)({
  width: "100%",
  display: "flex",
  minHeight: "600px",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto",
});

export const AboutUsContainer = styled("div")({
  width: "100%",
  display: "flex",
  minHeight: "400px",
  alignItems: "center",
  justifyContent: "center",
  margin: "30px 0px 50px 0px",
});

export const AboutUsSubtitle = styled("div")({
  opacity: "0.7",
  paddingBottom: "30px",
  fontSize: "18px",
});

export const Subtitle = styled("div")({
  opacity: "0.7",
});

export const Subtitle2 = styled("div")({
  opacity: "0.7",
  marginTop: "90px",
});

export const LargeImage = styled("div")({
  width: "100%",
});

export const SmallImage = styled("div")({
  marginTop: "0px",
  width: "80%",
});

export const SectionGridContainer = styled("div")({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  minHeight: "300px",
});

export const SectionGridItem = styled("div")({
  backgroundColor: "#f2f0f1",
  textAlign: "center",
  padding: "30px",
  width: "200px",
  borderRadius: "10px",
  margin: "10px !important",
});

export const InputField = styled("div")({
  marginBottom: "20px !important",
});

export const TextArea = styled("div")({
  width: "100%",
  marginBottom: "20px",
  fontSize: "16px",
  padding: "10px",
});

export const Avatar = styled("div")({
  marginRight: "10px",
});

export const FooterContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  padding: "20px",
  justifyContent: "center",
  backgroundColor: "white",
  flexDirection: "column",
});
