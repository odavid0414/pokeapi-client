import { AppShell } from "@mantine/core";
import { Outlet } from "react-router-dom";



const LoginLayout = () => {
  return (
    <AppShell padding="md" aside={{ width: "50%", breakpoint: 'md', collapsed: { desktop: false, mobile: false } }}>
      <AppShell.Main style={{ width: "878px", maxWidth: "100%", background: "url('../assets/bg.png') lightgray 50% / cover no-repeat"}}>

      </AppShell.Main>
      <AppShell.Aside w={"50%"} style={{ display: "flex", justifyContent: "center", alignItems: "center"}}>
       <Outlet />
      </AppShell.Aside>
    </AppShell>
  );
};

export default LoginLayout;
