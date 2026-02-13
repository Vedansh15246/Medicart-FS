import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  fetchAdminMedicines,
  deleteMedicine
} from "./adminApi";
import ProductsTable from "./ProductsTable";
import ProductEditorModal from "./ProductEditorModal";
import { useToast } from '../../components/ui/Toast';
import "./admin.css";
import "./batch.css"

export default function AdminProductsPage() {
  const [editingProduct, setEditingProduct] = useState(null);
  const [search, setSearch] = useState("");
  const { showToast, showConfirm } = useToast();

  const {
    data: rawData, // Rename to rawData for safety check
    isLoading,
    refetch
  } = useQuery({
    queryKey: ["admin-medicines"],
    queryFn: fetchAdminMedicines
  });

  // ✅ FIX: Extract the array from rawData (handles plain arrays or Spring Page objects)
  const data = Array.isArray(rawData) ? rawData : (rawData?.content || []);

  const filtered = data.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (product) => {
    const confirmed = await showConfirm(
      "Delete Medicine",
      `Are you sure you want to delete "${product.name}"?`,
      { variant: "danger", okText: "Delete", cancelText: "Cancel" }
    );
    if (confirmed) {
      try {
        await deleteMedicine(product.id);
        showToast(`"${product.name}" deleted successfully`, "success");
        refetch();
      } catch (err) {
        showToast("Failed to delete medicine", "error");
      }
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div>
          <h1>Admin — Medicines</h1>
          <p>Manage product catalog</p>
        </div>

        <button
          className="btn-Primary"
          onClick={() => setEditingProduct({})}
        >
          + Add Medicine
        </button>
      </div>

      <input
        className="admin-search"
        placeholder="Search by name or SKU..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {isLoading ? (
        <p className="status">Loading medicines...</p>
      ) : (
        <ProductsTable
          products={filtered}
          onEdit={setEditingProduct}
          onDelete={handleDelete}
        />
      )}

      <ProductEditorModal
        product={editingProduct}
        onClose={() => setEditingProduct(null)}
        onSaved={refetch}
      />
    </div>
  );
}