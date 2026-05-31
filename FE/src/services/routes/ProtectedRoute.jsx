// import { useUser } from "@clerk/clerk-react";
// import { Navigate } from "react-router-dom";

// const ProtectedRoute = ({ element }) => {
//   const { user } = useUser();
//   return user ? element : <Navigate to="/login" replace />;
// };

// export default ProtectedRoute;
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";

const ProtectedRoute = ({ element }) => {
  return (
    <>
      <SignedIn>{element}</SignedIn>
      <SignedOut>
        <RedirectToSignIn
          redirectUrl="/login"
        />
      </SignedOut>
    </>
  );
};

export default ProtectedRoute;
