function deleteRow(row) {
  var i = row.parentNode.parentNode.rowIndex;
  document.getElementById("eventReservations").deleteRow(i);
}
