import { Route, Routes } from "react-router-dom"
import PokeDetails from "./pages/pokeDetails"
import ProtectedRoute from "./services/protectedRoute"
import Home from "./pages/home"
import { Login } from "./pages/login"
import LoginLayout from "./layout/loginLayout"
import Registration from "./pages/registration"

function App() {

  return (
    <Routes>
      <Route element={<LoginLayout />}>
        <Route path="/registration" element={<Registration />} />
        <Route path="/login" element={<Login />} />
      </Route>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

      <Route
        path="/pokeDetails/:pokeId"
        element={
          <ProtectedRoute>
            <PokeDetails />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<div>404 - Page Not Found</div>} />
    </Routes>
  )
}

export default App
