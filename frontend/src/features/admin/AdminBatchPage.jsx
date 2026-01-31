import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { fetchBatches, fetchMedicines, deleteBatch } from "./batchApi";
import BatchTable from "./BatchTable";
import BatchEditorModal from "./BatchEditorModal";
import "./batch.css";
import "./admin.css";

export default function AdminBatchPage() {
  const [editingBatch, setEditingBatch] = useState(null);

  const { data: batches = [], refetch } = useQuery({
    queryKey: ["batches"],
    queryFn: fetchBatches,
  });

  const { data: medicines = [] } = useQuery({
    queryKey: ["medicines"],
    queryFn: fetchMedicines,
  });

  const handleDeleteBatch = async (id) => {
    try {
      await deleteBatch(id);
      refetch();
    } catch (error) {
      console.error("Error deleting batch:", error);
      alert("Failed to delete batch");
    }
  };

  return (
    <div className="batch-container">
      <div className="batch-header">
        <div>
          <h1>Batch & Inventory</h1>
          <p>Manage stock, expiry & batch tracking</p>
        </div>

        <button className="btn-Primary" onClick={() => setEditingBatch({})}>
          + Add Batch
        </button>
      </div>

      {/* This container handles the responsive reordering */}
      <div className="table-section">
        <div className="table-wrapper">
          <BatchTable
            batches={batches}
            medicines={medicines}
            onEdit={setEditingBatch}
            onDelete={handleDeleteBatch}
          />
        </div>

        {/* NOTE: If your pagination buttons are inside <BatchTable />, 
           move them here instead so they can be reordered to the top.
        */}
      
      </div>

      <BatchEditorModal
        batch={editingBatch}
        medicines={medicines}
        onClose={() => setEditingBatch(null)}
        onSaved={refetch}
      />
    </div>
  );
}