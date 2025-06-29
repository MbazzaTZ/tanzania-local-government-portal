import React, { useState, useEffect, createContext, useContext } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// We are importing the .tsx files we just renamed
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./pages/AdminDashboard";
import MwananchiDashboard from "./pages/MwananchiDashboard";

// We are importing from the .ts file we just renamed
import { auth, db } from "./firebase-config";
// This is important: We are importing the "User" type definition from the firebase library.
// This tells TypeScript exactly what a Firebase user object looks like.
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

// --- We are creating a "rulebook" for our authentication data ---
interface AuthContextType {
  currentUser: User | null; // A user can be a Firebase User object, or null if not logged in.
  userRole: string | null; // A user's role will be a string (like "admin"), or null.
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // We tell TypeScript the specific types for our state variables
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null); // Before, this was just `null`. Now it can be a string OR null.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Here, we explicitly tell TypeScript that the 'user' parameter will be a Firebase User or null.
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      setCurrentUser(user);
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUserRole(userDocSnap.data().role);
        } else {
          setUserRole(null);
        }
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Main App Component
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset" element={<ResetPassword />} />

          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/mwananchi" element={<MwananchiDashboard />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
// ... (keep all your existing imports like useState, useEffect, etc.)
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
// ... (import all your other pages)
import { AuthProvider } from './context/AuthContext'; // Assuming AuthProvider is here or in its own file
import Layout from './components/Layout'; // <-- 1. IMPORT THE NEW LAYOUT

// ... (keep your AuthContext and AuthProvider code)

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* 2. WRAP EVERYTHING IN THE LAYOUT COMPONENT */}
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            {/* ... all your other <Route> elements ... */}
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;