// import { createContext, useContext, useEffect, useState } from "react";
// import { auth, onAuthStateChanged } from "../../firebase";

// const AuthContext = createContext(null);

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       if (user) {
//         const role = user?.email === "admin@example.com" ? "admin" : "user"; // Assign role based on email 
//         setUser({ ...user, role });
//       } else {
//         setUser(null);
//       }
//     });

//     return () => unsubscribe();
//   }, []);

//   return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
// };

// export const useAuth = () => useContext(AuthContext);