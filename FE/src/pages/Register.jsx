import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import { ErrorMessage, Formik, Field, Form } from "formik";
import { auth, createUserWithEmailAndPassword, updateProfile } from "../firebase";

const Register = () => {
  const navigate = useNavigate();
  const [isSigningUp, setIsSigningUp] = useState(false); // State to handle loading status

  // Initial form values
  const initialValues = {
    name: "",
    email: "",
    password: "",
  };

  // Validation schema using Yup
  const validationSchema = yup.object({
    name: yup.string().required("Name is required"),
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
    setIsSigningUp(true);
  
    try {
      // Register user in Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;
  
      // Ensure user exists before updating profile
      if (user) {
        await updateProfile(user, { displayName: values.name });
        sessionStorage.setItem("userName", values.name);
        sessionStorage.setItem("userEmail", user.email);

        console.log("User Registered:", user.displayName);
        resetForm();
        navigate("/dashboard");
      } else {
        throw new Error("User registration failed. Please try again.");
      }
  
    } catch (error) {
      let errorMessage = "An unexpected error occurred. Please try again.";
  
      switch (error.code) {
        case "auth/email-already-in-use":
          errorMessage = "This email is already registered. Please log in instead.";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email format. Please enter a valid email address.";
          break;
        case "auth/weak-password":
          errorMessage = "Password should be at least 6 characters long.";
          break;
        case "auth/network-request-failed":
          errorMessage = "Network error. Please check your internet connection.";
          break;
        case "auth/operation-not-allowed":
          errorMessage = "Email/password sign-up is disabled. Please contact support.";
          break;
        default:
          errorMessage = error.message;
      }
  
      console.error("Registration error:", error.message);
      alert(errorMessage); 
    }
  
    setIsSigningUp(false);
  };

  return (
    <div className="w-full h-screen flex justify-center items-center bg-[#eee]">
      <div className="w-96 p-6 border border-gray-300 shadow-lg rounded-xl bg-white">
        {/* Page title */}
        <h3 className="text-gray-800 text-2xl font-bold text-center mt-2">
          Create Account
        </h3>

        {/* Formik wrapper for form handling */}
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={onSubmitHandler}
        >
          {({ isSubmitting }) => (
            <Form className="mt-8 grid gap-5">
              {/* Name field */}
              <div className="flex flex-col">
                <label
                  htmlFor="name"
                  className="text-gray-600 text-sm font-bold"
                >
                  Name
                </label>
                <Field
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your name"
                  className="mt-2 px-3 py-2 border border-gray-300 rounded-md text-gray-700 focus:border-indigo-500 focus:outline-none transition duration-300"
                />
                <ErrorMessage
                  component="p"
                  className="text-red-500 text-sm"
                  name="name"
                />
              </div>

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
                disabled={isSigningUp || isSubmitting}
                className={`text-white font-medium px-4 py-3 rounded-md transition duration-300 ${
                  isSigningUp
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-indigo-500 hover:bg-indigo-700"
                }`}
              >
                {isSigningUp ? "Signing Up..." : "Register"}
              </button>
            </Form>
          )}
        </Formik>

        {/* Link to login page */}
        <p className="mt-4 text-center text-sm">
          Already have an account?
          <a
            href="/login"
            className="text-blue-600 font-bold hover:underline"
          >
            Log in
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
