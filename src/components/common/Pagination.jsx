import Pagination from "@mui/material/Pagination";
import "../../styles/Pagination.css";

function PaginationComponent({ page, totalPages, totalElements, pageSize, onPageChange }) {
  const handleChange = (event, value) => {
    onPageChange(value);
  };

  const startItem = totalElements === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalElements);

  return (
    <div className="pagination-wrapper">
      <span className="pagination-text">
        Affichage de <strong>{startItem}</strong> à <strong>{endItem}</strong> sur <strong>{totalElements}</strong> trajets
      </span>

      <Pagination
        count={totalPages}
        page={page}
        onChange={handleChange}
        shape="rounded"
        variant="outlined"
      />
    </div>
  );
}

export default PaginationComponent;