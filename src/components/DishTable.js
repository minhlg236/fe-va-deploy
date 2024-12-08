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
  Checkbox,
  IconButton,
} from "@mui/material";
import {
  Delete as DeleteIcon,
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

function DishTableHead({
  order,
  orderBy,
  onRequestSort,
  onSelectAllClick,
  numSelected,
  rowCount,
}) {
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  const columns = [
    { id: "dishId", label: "Dish ID" },
    { id: "name", label: "Name" },
    { id: "dishType", label: "Type" },
    { id: "price", label: "Price" },
    { id: "preferenceName", label: "Preference" },
    { id: "status", label: "Status" },
  ];

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
          />
        </TableCell>
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
        <TableCell align="right">Actions</TableCell>
      </TableRow>
    </TableHead>
  );
}

DishTableHead.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

export default function DishTable({ dishes, handleDeleteClick }) {
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("dishId");
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const navigate = useNavigate();

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = dishes.map((dish) => dish.dishId);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  return (
    <Box sx={{ width: "100%" }}>
      <Paper sx={{ width: "100%", mb: 2 }}>
        <TableContainer>
          <Table>
            <DishTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              rowCount={dishes.length}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
            />
            <TableBody>
              {stableSort(dishes, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((dish) => {
                  const isItemSelected = isSelected(dish.dishId);
                  return (
                    <TableRow
                      hover
                      role="checkbox"
                      tabIndex={-1}
                      key={dish.dishId}
                      selected={isItemSelected}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          checked={isItemSelected}
                          onChange={() => {
                            const selectedIndex = selected.indexOf(dish.dishId);
                            let newSelected = [];
                            if (selectedIndex === -1) {
                              newSelected = newSelected.concat(
                                selected,
                                dish.dishId
                              );
                            } else if (selectedIndex === 0) {
                              newSelected = newSelected.concat(
                                selected.slice(1)
                              );
                            } else if (selectedIndex === selected.length - 1) {
                              newSelected = newSelected.concat(
                                selected.slice(0, -1)
                              );
                            } else if (selectedIndex > 0) {
                              newSelected = newSelected.concat(
                                selected.slice(0, selectedIndex),
                                selected.slice(selectedIndex + 1)
                              );
                            }
                            setSelected(newSelected);
                          }}
                        />
                      </TableCell>
                      <TableCell>{dish.dishId}</TableCell>
                      <TableCell>{dish.name}</TableCell>
                      <TableCell>{dish.dishType}</TableCell>
                      <TableCell>{dish.price} VNĐ</TableCell>
                      <TableCell>{dish.preferenceName}</TableCell>
                      <TableCell>{dish.status}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          onClick={() => handleDeleteClick(dish.dishId)}
                        >
                          <DeleteIcon />
                        </IconButton>
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
