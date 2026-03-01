import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { LoginView } from "./components/LoginView";
import { StudentView } from "./components/StudentView";
import { FacultyView } from "./components/FacultyView";
import { AdminView } from "./components/AdminView";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: LoginView },
      { path: "student", Component: StudentView },
      { path: "faculty", Component: FacultyView },
      { path: "admin", Component: AdminView },
    ],
  },
]);
