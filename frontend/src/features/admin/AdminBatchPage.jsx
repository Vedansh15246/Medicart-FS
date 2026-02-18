import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { fetchBatches, fetchMedicines, deleteBatch } from "./batchApi";
import BatchTable from "./BatchTable";
import BatchEditorModal from "./BatchEditorModal";
import AlertModal from "../../components/ui/AlertModal";
import { useToast } from '../../components/ui/Toast';
import "./batch.css";
import "./admin.css";

export default function AdminBatchPage() {
  const [editingBatch, setEditingBatch] = useState(null);
  const [alertModal, setAlertModal] = useState({ open: false, title: "", message: "", type: "info" });
  const { showToast } = useToast();

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
      showToast("Batch deleted successfully", "success");
      refetch();
    } catch (error) {
      console.error("Error deleting batch:", error);
      showToast("Failed to delete batch", "error", "Delete Error");
    }
  };

  return (
    <div className="batch-container">
      <div className="batch-header">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Batch & Inventory</h1>
          <p className="text-slate-500 text-sm font-medium">Manage stock, expiry & batch tracking</p>
        </div>

        <button className="btn-primary" onClick={() => setEditingBatch({})}>
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

      <AlertModal
        isOpen={alertModal.open}
        onClose={() => setAlertModal((s) => ({ ...s, open: false }))}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
    </div>
  );
}