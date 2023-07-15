import { useState } from "react";
import { NavLink } from "react-router-dom";
import styles from "../../styles/SideBar.module.css";

import HomeIcon from '@mui/icons-material/Home';
import MenuIcon from '@mui/icons-material/Menu';
import PeopleIcon from '@mui/icons-material/People';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import FeedbackIcon from '@mui/icons-material/Feedback';
import LogoutIcon from '@mui/icons-material/Logout';

const navDataLink = [
    {
        id: 0,
        // icon: <PeopleIcon/>,
        text: "About Us",
        link: "/"
    },
    {
        id: 1,
        // icon: <LibraryBooksIcon/>,
        text: "Blogs",
        link: "/"
    },
    {
        id: 2,
        // icon: <QuestionAnswerIcon/>,
        text: "FAQs",
        link: "/"
    },
    {
        id: 3,
        // icon: <ContactPhoneIcon/>,
        text: "Contact",
        link: "/"
    }
]
const navDataConvo = [
    {
        id: 4,
        icon: <RefreshIcon/>,
        text: "Refresh Conversation",
        link: "/"
    },
    {
        id: 5,
        icon: <AddIcon/>,
        text: "New Conversation",
        link: "/"
    },
    {
        id: 6,
        icon: <CloseIcon/>,
        text: "Clear Conversation",
        link: "/"
    },
    {
        id: 7,
        icon: <SaveIcon/>,
        text: "Save Conversation",
        link: "/"
    },
    {
        id: 8,
        icon: <FeedbackIcon/>,
        text: "Feedback",
        link: "/"
    },
    {
        id: 9,
        icon: <LogoutIcon/>,
        text: "Logout",
        link: "/"
    }
]

export default function SideBar() {
    const [open, setopen] = useState(false);
    const toggleOpen = () => {
        setopen(!open)
    }
    return (
        <div className={open?styles.sidenav:styles.sidenavClosed}>
            {/* <button className={styles.menuBtn} onClick={toggleOpen}>
                {open? <MenuIcon /> : <MenuIcon/>}
            </button> */}
            <button className={open?styles.menuOpen:styles.menuBtn} onClick={toggleOpen}>
                <MenuIcon />
            </button>
            <div className={styles.aboutBar}>
                {open && navDataLink.map(item => {
                    return <NavLink key={item.id} className={styles.sideitemLink} to={item.link}>
                        {item.icon}
                        <span className={styles.linkTextAbout}>{item.text}</span>
                    </NavLink>
                })}
            </div>

            <div className={styles.convoBar}>
                {navDataConvo.map(item =>{
                    return <NavLink key={item.id} className={styles.sideitemConvo} to={item.link}>
                    {item.icon}
                    <span className={styles.linkText}>{item.text}</span>
                </NavLink>
                })}
            </div>
            
        </div>
    )
    
}

