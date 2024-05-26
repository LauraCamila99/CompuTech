import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import Spinner from '../spinner/Spinner'; // Asegúrate de importar Spinner
import API_URL from "../../config";

export default function ProductForm() {
  // Cloudinary 
  const preset = 'presetComputech'; 
  const cloudName = 'damfsltm2';
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const [url_img, setUrl_img] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  console.log('url de la imagen cloudinary', url_img);

  const changeUploadImage = async (e) => {
    const file = e.target.files[0];
    console.log(file);

    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', preset);

    try {
      const response = await axios.post(url, data);
      console.log(response.data);
      setUrl_img(response.data.secure_url);
    } catch (error) {
      Swal.fire('Error al subir la imagen');
      console.error(error);
    }
  };

  // Reset image
  const deleteImage = () => {
    setUrl_img('');
  };

  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    brand: "",
    category: ""
  });
  const [errors, setErrors] = useState({});
  const [nameLengthError, setNameLengthError] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === 'name') {
      if (value.length > 50) {
        setNameLengthError(true);
        return;
      } else {
        setNameLengthError(false);
      }
    }

    if (name === 'price') {
      if (!/^\d*\.?\d*$/.test(value)) {
        return;
      }
    }

    setProduct({
      ...product,
      [name]: value
    });
    setErrors({
      ...errors,
      [name]: ''
    });
  };

  const validateForm = () => {
    let newErrors = {};
    let isValid = true;
    let missingFields = [];

    if (!product.name) {
      newErrors.name = "El nombre es obligatorio.";
      isValid = false;
      missingFields.push("Nombre");
    }
    if (!product.description) {
      newErrors.description = "La descripción es obligatoria.";
      isValid = false;
      missingFields.push("Descripción");
    }
    if (!product.price) {
      newErrors.price = "El precio es obligatorio.";
      isValid = false;
      missingFields.push("Precio");
    }
    if (product.price && isNaN(product.price)) {
      newErrors.price = "El precio debe ser un número.";
      isValid = false;
      missingFields.push("Precio válido");
    }
    if (!url_img) {
      newErrors.image = "La imagen es obligatoria.";
      isValid = false;
      missingFields.push("Imagen");
    }
    if (!product.stock) {
      newErrors.stock = "El stock es obligatorio.";
      isValid = false;
      missingFields.push("Stock");
    }
    if (product.stock && isNaN(product.stock)) {
      newErrors.stock = "El stock debe ser un número.";
      isValid = false;
      missingFields.push("Stock válido");
    }
    if (!product.brand) {
      newErrors.brand = "La marca es obligatoria.";
      isValid = false;
      missingFields.push("Marca");
    }
    if (!product.category) {
      newErrors.category = "La categoría es obligatoria.";
      isValid = false;
      missingFields.push("Categoría");
    }

    setErrors(newErrors);

    if (!isValid) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Los siguientes campos son obligatorios: ${missingFields.join(', ')}`
      });
    }

    return isValid;
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (validateForm()) {
      const parsedProduct = {
        ...product,
        price: parseFloat(product.price),
        stock: parseInt(product.stock, 10),
        image: url_img.split(',').map(img => img.trim())
      };

      try {
        const response = await fetch(`${API_URL}/products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(parsedProduct),
        });

        if (response.ok) {
          Swal.fire({
            position: "center",
            icon: "success",
            title: "Producto guardado correctamente",
            showConfirmButton: true,
            confirmButtonText: "Agregar otro producto",
            cancelButtonText: "Volver al Home",
            showCancelButton: true,
          }).then((result) => {
            if (result.isConfirmed) {
              // Agregar otro producto
              setProduct({
                name: "",
                description: "",
                price: "",
                stock: "",
                brand: "",
                category: ""
              });
              setUrl_img('');
              setErrors({});
            } else {
              // Volver al Home
              setIsLoading(true);
              setTimeout(() => {
                navigate('/');
              }, 1500);
            }
          });
        } else {
          const errorData = await response.json();
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: errorData.message || "Something went wrong!",
            footer: '<a href="#">Why do I have this issue?</a>'
          });
        }
      } catch (error) {
        console.error('Error:', error);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Error al guardar el producto",
          footer: '<a href="#">Why do I have this issue?</a>'
        });
      }
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 antialiased md:py-5">
      <div className="max-w-md w-full p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">Añade un producto</h1>
        <form onSubmit={handleSave}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre</label>
            <input
              type="text"
              id="name"
              name="name"
              value={product.name}
              onChange={handleChange}
              className={`mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 ${errors.name ? 'border-red-500' : ''}`}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            {nameLengthError && <p className="text-red-500 text-sm mt-1">Has alcanzado el límite de 50 caracteres</p>}
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción</label>
            <textarea
              id="description"
              name="description"
              value={product.description}
              onChange={handleChange}
              className={`mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 h-32 resize-none overflow-y-auto focus:outline-none dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 ${errors.description ? 'border-red-500' : ''}`}
            ></textarea>
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>
          <div className="mb-4">
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Precio</label>
            <input
              type="text"
              id="price"
              name="price"
              value={product.price}
              onChange={handleChange}
              className={`mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 ${errors.price ? 'border-red-500' : ''}`}
            />
            {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
          </div>
          <div className="mb-4">
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Imagen</label>
            <input
              type="file"
              accept="image/*"
              id="image"
              name="image"
              onChange={changeUploadImage}
              className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
            />
            {url_img && (
              <div>
                <img src={url_img} alt="Uploaded" className="mt-2" />
                <button
                  type="button"
                  className="text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded mt-2"
                  onClick={deleteImage}
                >
                  Eliminar imagen
                </button>
              </div>
            )}
            {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
          </div>
          <div className="mb-4">
            <label htmlFor="stock" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Stock</label>
            <input
              type="number"
              id="stock"
              name="stock"
              value={product.stock}
              onChange={handleChange}
              className={`mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 ${errors.stock ? 'border-red-500' : ''}`}
            />
            {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock}</p>}
          </div>
          <div className="mb-4">
            <label htmlFor="brand" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Marca</label>
            <input
              type="text"
              id="brand"
              name="brand"
              value={product.brand}
              onChange={handleChange}
              className={`mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 ${errors.brand ? 'border-red-500' : ''}`}
            />
            {errors.brand && <p className="text-red-500 text-sm mt-1">{errors.brand}</p>}
          </div>
          <div className="mb-4">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoría</label>
            <input
              type="text"
              id="category"
              name="category"
              value={product.category}
              onChange={handleChange}
              className={`mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 ${errors.category ? 'border-red-500' : ''}`}
            />
            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
          </div>
          <div className="text-center">
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Enviar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}