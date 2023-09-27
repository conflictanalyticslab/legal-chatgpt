"use client";
import React from "react";
import Image from "next/image";
import {
  AppBar,
  Link,
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Drawer,
} from "@mui/material";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import logo from "../../images/RobotoLogo.png";
import { BlackMenuIcon, MyToolbar } from "@/styles/styles";

function ElevationScroll({ children }: { children: React.ReactElement }) {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
    target: undefined, // used to pass in a window ref here but stopped because we don't have an iframe demo anymore
  });

  return React.cloneElement(children, {
    elevation: trigger ? 4 : 0,
  });
}

export function PublicHeader() {
  const links = [
    { id: 1, route: "About Us", url: "https://conflictanalytics.queenslaw.ca/" },
    { id: 2, route: "Publications", url: "https://conflictanalytics.queenslaw.ca/publications" },
    { id: 3, route: 'Blogs', url: "https://myopencourt.org/blog/"},
    { id: 4, route: "FAQs", url: "https://myopencourt.org/faqs/" },
    // { id: 5, route: "Sign In", url: "/login" },
  ];

  const [state, setState] = React.useState({
    right: false,
  });

  const toggleDrawer = (anchor: string, open: boolean) => (event: any) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }

    setState({ ...state, [anchor]: open });
  };

  const list = (anchor: string) => (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(anchor, false)}
      onKeyDown={toggleDrawer(anchor, false)}
    >
      <List>
        {links.map((link) => (
          <ListItem button key={link.id}>
            <ListItemText primary={link.route} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <ElevationScroll>
      <AppBar position="sticky">
        <MyToolbar>
          <Link href="/">
            <Image
              src={logo}
              alt="My Team"
              style={{
                margin: "auto",
                marginLeft: "50px",
              }}
              height={62}
            />
          </Link>

          {matches ? (
            <Box>
              <IconButton
                size="large"
                edge="end"
                color="inherit"
                aria-label="menu"
                onClick={toggleDrawer("right", true)}
              >
                <BlackMenuIcon />
              </IconButton>

              <Drawer
                anchor="right"
                open={state["right"]}
                onClose={toggleDrawer("right", false)}
              >
                {list("right")}
              </Drawer>
            </Box>
          ) : (
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                flexGrow: "0.1",
                marginRight: "60px",
              }}
            >
              {links.map((link) => (
                <Link
                  href={link.url}
                  style={{
                    color: "#000",
                    fontSize: "1.2rem",
                    fontWeight: "bold",
                    paddingRight: "12px",
                  }}
                  target="_blank"
                  underline="none"
                  key={link.url}
                >
                  {link.route}
                </Link>
              ))}
            </Box>
          )}
        </MyToolbar>
      </AppBar>
    </ElevationScroll>
  );
}

export default PublicHeader;
