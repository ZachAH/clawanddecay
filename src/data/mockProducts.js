// src/data/mockProducts.js

export const mockProducts = [
  {
    id: "printify-mock-product-1",
    title: "Celestial Owl T-Shirt",
    description: "Embrace the night with this mystical owl design. High-quality print on a comfortable tee.",
    images: [
      { src: "https://via.placeholder.com/400x300?text=Celestial+Owl+T-Shirt", alt: "Celestial Owl T-Shirt Front" },
      { src: "https://via.placeholder.com/400x300?text=Celestial+Owl+Back", alt: "Celestial Owl T-Shirt Back" }
    ],
    variants: [
      { id: "v1_s", title: "Small", price: 2299, currency: "USD" }, // Price in cents: $22.99
      { id: "v1_m", title: "Medium", price: 2299, currency: "USD" },
      { id: "v1_l", title: "Large", price: 2299, currency: "USD" },
      { id: "v1_xl", title: "XL", price: 2299, currency: "USD" }
    ],
    mockupImage: "https://via.placeholder.com/400x300?text=Celestial+Owl+Tee", // A simple placeholder
  },
  {
    id: "printify-mock-product-2",
    title: "Forest Spirit Mug",
    description: "Start your day with the tranquility of the forest. Durable ceramic mug, perfect for coffee or tea.",
    images: [
      { src: "https://via.placeholder.com/400x300?text=Forest+Spirit+Mug", alt: "Forest Spirit Mug" }
    ],
    variants: [
      { id: "v2_os", title: "One Size", price: 1599, currency: "USD" } // Price in cents: $15.99
    ],
    mockupImage: "https://via.placeholder.com/400x300?text=Forest+Mug",
  },
  {
    id: "printify-mock-product-3",
    title: "Dragon Scale Hoodie",
    description: "Unleash your inner beast with this unique dragon scale texture hoodie. Warm and stylish.",
    images: [
      { src: "https://via.placeholder.com/400x300?text=Dragon+Scale+Hoodie", alt: "Dragon Scale Hoodie Front" }
    ],
    variants: [
      { id: "v3_s", title: "Small", price: 4500, currency: "USD" },
      { id: "v3_m", title: "Medium", price: 4500, currency: "USD" }
    ],
    mockupImage: "https://via.placeholder.com/400x300?text=Dragon+Hoodie",
  },
  {
    id: "printify-mock-product-4",
    title: "Stardust Phone Case",
    description: "Protect your phone with a cosmic touch. Slim and durable case with a stardust design.",
    images: [
      { src: "https://via.placeholder.com/400x300?text=Stardust+Phone+Case", alt: "Stardust Phone Case" }
    ],
    variants: [
      { id: "v4_ip13", title: "iPhone 13", price: 1999, currency: "USD" },
      { id: "v4_s23", title: "Samsung S23", price: 1999, currency: "USD" }
    ],
    mockupImage: "https://via.placeholder.com/400x300?text=Phone+Case",
  },
];