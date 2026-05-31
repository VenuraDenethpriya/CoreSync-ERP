import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import { ErrorMessage, Formik, Field, Form } from "formik";
import { auth, signInWithEmailAndPassword } from "../firebase";

const Login = () => {
  const navigate = useNavigate();
  const [isSigningIn, setIsSigningIn] = useState(false); // State to handle loading status

  // Initial form values
  const initialValues = {
    email: "",
    password: "",
  };

  // Validation schema using Yup
  const validationSchema = yup.object({
    email: yup
      .string()
      .email("Email must be valid")
      .required("Email is required"),
    password: yup
      .string()
      .min(6, "Password must be greater than 6 characters")
      .required("Password is required"),
  });

  // Handle form submission
  const onSubmitHandler = async (values, { resetForm }) => {
    setIsSigningIn(true);
  
    try {
      // Authenticate user with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;
      // const token = await user.getIdToken();
      sessionStorage.setItem("userName", user.displayName || "User");
      sessionStorage.setItem("userEmail", user.email);

      console.log("User logged in:", user.displayName);
      navigate("/dashboard");
  
    } catch (error) {
      // Handle Firebase Auth Errors Properly
      let errorMessage = "An unexpected error occurred. Please try again.";
  
      if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email format. Please enter a valid email address.";
      } else if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email. Please register first.";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password. Please try again.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many failed login attempts. Please try again later.";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your internet connection.";
      }
  
      console.error("Login error:", error.message);
      alert(errorMessage); // Display error to the user
    }
  
    setIsSigningIn(false);
  };

  return (
    <div className="w-full h-screen flex justify-center items-center bg-[#eee]">
      <div className="w-96 p-6 border border-gray-300 shadow-lg rounded-xl bg-white">
        {/* Page title */}
        <h3 className="text-gray-800 text-2xl font-bold text-center mt-2">
          Welcome Back
        </h3>

        {/* Formik wrapper for form handling */}
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={onSubmitHandler}
        >
          {({ isSubmitting }) => (
            <Form className="mt-8 grid gap-5">
              {/* Email field */}
              <div className="flex flex-col">
                <label
                  htmlFor="email"
                  className="text-gray-600 text-sm font-bold"
                >
                  Email
                </label>
                <Field
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  className="mt-2 px-3 py-2 border border-gray-300 rounded-md text-gray-700 focus:border-indigo-500 focus:outline-none transition duration-300"
                />
                <ErrorMessage
                  component="p"
                  className="text-red-500 text-sm"
                  name="email"
                />
              </div>

              {/* Password field */}
              <div className="flex flex-col">
                <label
                  htmlFor="password"
                  className="text-gray-600 text-sm font-bold"
                >
                  Password
                </label>
                <Field
                  id="password"
                  name="password"
                  type="password"
                  placeholder="*****"
                  className="mt-2 px-3 py-2 border border-gray-300 rounded-md text-gray-700 focus:border-indigo-500 focus:outline-none transition duration-300"
                />
                <ErrorMessage
                  component="p"
                  className="text-red-500 text-sm"
                  name="password"
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSigningIn || isSubmitting}
                className={`text-white font-medium px-4 py-3 rounded-md transition duration-300 ${
                  isSigningIn
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-indigo-500 hover:bg-indigo-700"
                }`}
              >
                {isSigningIn ? "Logging In..." : "Login"}
              </button>
            </Form>
          )}
        </Formik>

        {/* Link to registration page */}
        <p className="mt-4 text-center text-sm">
          Don't have an account?{" "}
          <a
            href="/register"
            className="text-blue-600 font-bold hover:underline"
          >
            Sign up
          </a>
        </p>
        <p className="mt-2 text-center text-sm">
          Forgot{" "}
          <a
            href="/register"
            className="text-blue-600 font-bold hover:underline"
          >
            Password?
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
