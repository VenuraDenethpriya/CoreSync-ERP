import { SignUp } from "@clerk/clerk-react";

function RegisterPage() {
    return ( 
        <main className="flex items-center justify-center px-4 min-h-screen">
        <SignUp />
    </main>
     );
}

export default RegisterPage;