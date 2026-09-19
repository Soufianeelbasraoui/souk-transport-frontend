import Pagination from "@mui/material/Pagination";
import "../../styles/Pagination.css";

function PaginationComponent({
  page = 1,
  totalPages = 1,
  totalElements = 0,
  pageSize = 10,
  onPageChange,
  itemLabel = ""
}) {
  const handleChange = (event, value) => {
    if (onPageChange) {
      onPageChange(value);
    }
  };

  const startItem = totalElements === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalElements);

  return (
    <div className="pagination-wrapper">
      <span className="pagination-text">
        Affichage de <strong>{startItem}</strong> à <strong>{endItem}</strong> sur <strong>{totalElements}</strong>{itemLabel ? ` ${itemLabel}` : ""}
      </span>

      <Pagination
        count={Math.max(1, totalPages || 1)}
        page={page}
        onChange={handleChange}
        shape="rounded"
        variant="outlined"
      />
    </div>
  );
}

export default PaginationComponent;