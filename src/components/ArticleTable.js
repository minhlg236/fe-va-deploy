import React, { useState } from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate } from "react-router-dom";

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedArray = array.map((el, index) => [el, index]);
  stabilizedArray.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedArray.map((el) => el[0]);
}

function EnhancedTableHead(props) {
  const { order, orderBy, onRequestSort } = props;

  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  const columns = [
    { id: "articleId", label: "Article ID" },
    { id: "title", label: "Title" },
    { id: "content", label: "Content" }, // Thêm cột Content
    { id: "authorName", label: "Author" },
    { id: "imageUrl", label: "Image" }, // Thêm cột Image
    { id: "status", label: "Status" },
  ];

  return (
    <TableHead>
      <TableRow>
        {columns.map((column) => (
          <TableCell
            key={column.id}
            sortDirection={orderBy === column.id ? order : false}
            style={{ cursor: "pointer" }}
            onClick={createSortHandler(column.id)}
          >
            <span style={{ display: "flex", alignItems: "center" }}>
              {column.label}
              {orderBy === column.id ? (
                order === "asc" ? (
                  <ArrowDropUpIcon fontSize="small" />
                ) : (
                  <ArrowDropDownIcon fontSize="small" />
                )
              ) : null}
            </span>
          </TableCell>
        ))}
        <TableCell align="right">Actions</TableCell>
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
};

export default function ArticleTable({ rows }) {
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("articleId");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const navigate = useNavigate();

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  return (
    <Box sx={{ width: "100%" }}>
      <Paper sx={{ width: "100%", mb: 2 }}>
        <TableContainer>
          <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
            <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
            />
            <TableBody>
              {stableSort(rows, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => (
                  <TableRow hover key={row.articleId}>
                    <TableCell>{row.articleId}</TableCell>
                    <TableCell>
                      <span
                        style={{
                          display: "block",
                          width: "150px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        title={row.title}
                      >
                        {row.title}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        style={{
                          display: "block",
                          width: "200px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        title={row.content}
                      >
                        {row.content}
                      </span>
                    </TableCell>
                    <TableCell>{row.authorName}</TableCell>
                    <TableCell>
                      {row.imageUrl ? (
                        <img
                          src={row.imageUrl}
                          alt="Article"
                          style={{ width: "50px", height: "50px" }}
                        />
                      ) : (
                        "No Image"
                      )}
                    </TableCell>
                    <TableCell>
                      {row.status === "pending"
                        ? "Pending"
                        : row.status === "accepted"
                        ? "Accepted"
                        : "Unaccepted"}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={() =>
                          navigate(`/article-detail/${row.articleId}`)
                        }
                        color="primary"
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={7} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
}
