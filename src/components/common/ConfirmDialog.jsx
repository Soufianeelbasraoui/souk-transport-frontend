function ConfirmDialog({ show, title, message, onConfirm, onCancel }) {
  if (!show) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">

          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>

            <button
              type="button"
              className="btn-close"
              onClick={onCancel}
            />
          </div>

          <div className="modal-body">
            <p className="mb-0">{message}</p>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
            >
              Annuler
            </button>

            <button
              type="button"
              className="btn btn-danger"
              onClick={onConfirm}
            >
              Supprimer
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;