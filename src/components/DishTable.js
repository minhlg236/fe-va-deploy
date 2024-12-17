import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Paper,
  IconButton,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  ArrowDropUp as ArrowDropUpIcon,
  ArrowDropDown as ArrowDropDownIcon,
} from "@mui/icons-material";
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

function DishTableHead({ order, orderBy, onRequestSort }) {
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  const columns = [
    { id: "dishId", label: "ID" },
    { id: "name", label: "Tên món" },
    { id: "imageUrl", label: "Hình ảnh" },
    { id: "dishType", label: "Loại món" },
    { id: "price", label: "Giá" },
    { id: "preferenceName", label: "Trường phái" },
    { id: "status", label: "trạng thái" },
  ];
  return (
    <TableHead>
      <TableRow>
        {columns.map((column) => (
          <TableCell
            key={column.id}
            sortDirection={orderBy === column.id ? order : false}
            onClick={createSortHandler(column.id)}
            style={{ cursor: "pointer" }}
          >
            {column.label}
            {orderBy === column.id ? (
              order === "asc" ? (
                <ArrowDropUpIcon fontSize="small" />
              ) : (
                <ArrowDropDownIcon fontSize="small" />
              )
            ) : null}
          </TableCell>
        ))}
        <TableCell align="right">Hành động</TableCell>
      </TableRow>
    </TableHead>
  );
}

DishTableHead.propTypes = {
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
};

export default function DishTable({ dishes }) {
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("dishId");
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

  return (
    <Box sx={{ width: "100%" }}>
      <Paper sx={{ width: "100%", mb: 2 }}>
        <TableContainer>
          <Table>
            <DishTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
            />
            <TableBody>
              {stableSort(dishes, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((dish) => {
                  return (
                    <TableRow hover tabIndex={-1} key={dish.dishId}>
                      <TableCell>{dish.dishId}</TableCell>
                      <TableCell>{dish.name}</TableCell>
                      <TableCell>
                        {dish.imageUrl && (
                          <img
                            src={dish.imageUrl}
                            alt={dish.name}
                            style={{
                              width: "50px",
                              height: "50px",
                              objectFit: "cover",
                            }}
                          />
                        )}
                      </TableCell>
                      <TableCell>{dish.dishType}</TableCell>
                      <TableCell>{dish.price} VNĐ</TableCell>
                      <TableCell>{dish.preferenceName}</TableCell>
                      <TableCell>{dish.status}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          onClick={() => navigate(`/dish/${dish.dishId}`)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={dishes.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
}
