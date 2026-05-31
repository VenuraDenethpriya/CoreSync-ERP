import { useAuth, useClerk } from "@clerk/clerk-react";

const apiUrl = import.meta.env.VITE_API_BASE_GO_URL;

// Api for creating new product
export const createProduct = async (token, productData) => {
  try {
    const response = await fetch(`${apiUrl}/products`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(productData),
    });
    return response.json();
  } catch (error) {
    console.error("Error creating product:", error);
  }
};

//Api for getting all products
export const fetchProductsList = async (token,query, limit, offset) => {
  try {
    const response = await fetch(`${apiUrl}/products?query=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    return response.json();
  } catch (error) {
    console.error("Error fetching products:", error);
  }
};


//Api for getting a single product by id
export const fetchProductById = async (toekn, productId) => {
  try {
    const response = await fetch(`${apiUrl}/products/${productId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${toekn}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    return response.json();
  } catch (error) {
    console.error("Error fetching product:", error);
  }
};

//Api for updating a product by id
export const updateProduct = async (token, productId, productData) => {
  try {
    const response = await fetch(`${apiUrl}/products/${productId}`, {
      method: "PUT",
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json" 
      },
      credentials: "include",
      body: JSON.stringify(productData),
    });
    return response.json();
  } catch (error) {
    console.error("Error updating product:", error);
  }
};

//Api for deleting a product by id
export const deleteProduct = async (token, productId) => {
  try {
    const response = await fetch(`${apiUrl}/products/${productId}`, {
      method: "DELETE",
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json" 
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Failed to delete product: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

// Aoi for feach basic product data
export const fetchBasicProductsList = async (token) => {
  try {
    const response = await fetch(`${apiUrl}/products/basic-info`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        //Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });
    return response.json();
  } catch (error) {
    console.error("Error fetching products:", error);
  }
};