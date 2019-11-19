//Builds table
   var row = tableRows.length;
   var headers = ['First Name','Last Name', 'E-mail', 'Date', 'Time', 'Location'];
   var headerLength = headers.length;
   var table1 = document.createElement("table");  //create a table node
   table1.setAttribute("id", "table1");
	 table1.setAttribute("class", "table table-light");
   var head = document.createElement("thead");  //create header (thead) node
   var headRow = document.createElement("tr");  //create a (tr) row node
   for (var i = 0; i < headerLenght; i++) {
     var headCell = document.createElement("th");  //create header (th) cell
     headCell.textContent = headers[i];
     headRow.appendChild(headCell);
     head.appendChild(headRow);
   }
   table1.appendChild(head);
   var tableBody = document.createElement("tbody");
   for(var j = 0; j < row; j++){
     var newRow = document.createElement("tr");
     for (var prop in tableRows[j]) {
         var rowElement = document.createElement("td");
         rowElement.textContent = tableRows[j][prop];
         newRow.appendChild(rowElement);
       }
       tableBody.appendChild(newRow);
     }
   var para = document.createElement('p');
   para.textContent = "reservations";
   table1.appendChild(tableBody);
   div1 = document.getElementById("resv");
   div1.appendChild(para);
   div1.appendChild(table1);
