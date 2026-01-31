import { useDispatch, useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { setSearchQuery, setCategory } from "./productSlice";
import { fetchMedicines } from "./catalogApi";
import ProductCard from "./ProductCard";
import Navbar from "../../components/navbar/Navbar";
import MedicineModal from "../../components/modal/MedicineModal";
import "./home.css";
import CartSummary from "../../components/cart/CartSummary";

export default function HomePage() {
  const dispatch = useDispatch();
  const { q, category } = useSelector(
    (state) => state.products.search
  );

  const [selectedProduct, setSelectedProduct] = useState(null);

  // ✅ Fetch medicines
  // ✅ Correct data extraction in HomePage.jsx
const { data: rawData, isLoading, isError } = useQuery({
  queryKey: ["medicines"],
  queryFn: fetchMedicines,
});

// Safely ensure 'data' is always an array before filtering
const data = Array.isArray(rawData) 
  ? rawData 
  : (rawData?.content || []); // Handles Spring Boot Pagination (content field)

const searchText = q.trim().toLowerCase();

// This will no longer crash
const filteredData = data.filter((item) => {
  const matchesSearch =
    item.name?.toLowerCase().includes(searchText) ||
    item.sku?.toLowerCase().includes(searchText);

  const matchesCategory =
    category === "ALL" ? true : item.category === category;

  return matchesSearch && matchesCategory;
});
  return (
    <div className="page">
      {/* NAVBAR */}
      <Navbar
        searchValue={q}
        onSearch={(val) => dispatch(setSearchQuery(val))}
      />

      {/* CATEGORY FILTER */}
      <div className="categories">
        {["ALL", "Tablet", "Capsule", "Syrup", "Injection", "Powder"].map(
          (c) => (
            <button
              key={c}
              className={`pill ${category === c ? "active" : ""}`}
              onClick={() => dispatch(setCategory(c))}
            >
              {c}
            </button>
          )
        )}
      </div>

      {/* CONTENT */}
      <section className="content">
        {isLoading && <p className="status">Loading medicines...</p>}

        {isError && (
          <p className="status error">
            Failed to load medicines. Check API.
          </p>
        )}

        {!isLoading && !isError && filteredData.length === 0 && (
          <p className="status">No medicines found</p>
        )}

        <div className="grid">
          {filteredData.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onViewMore={setSelectedProduct}
            />
          ))}
        </div>
      </section>

  
      <MedicineModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      <CartSummary />


    </div>
  );
}
