//Pulls table with reservation info from database.
//and calls function to create table on page.
let eventId = 173;
resvTable(eventId);


let resvTable = async function(eventId){
  try {
    let table = await slot.eventSlotResv(eventId);
    createResvTable(table);
  }
  catch (err) {
    console.log(err);
  }
};

createResvTable(table){
  var input = document.createElement("input");
  input.setAttribute('type', 'email');
  input.setAttribute('class', 'form-control w-100');
  input.setAttribute('name', 'emails');
  input.setAttribute('id', 'email' + inputNumber);
  input.value = email;
}

let mountains = [
  { name: "Monte Falco", height: 1658, place: "Parco Foreste Casentinesi" },
  { name: "Monte Falterona", height: 1654, place: "Parco Foreste Casentinesi" },
  { name: "Poggio Scali", height: 1520, place: "Parco Foreste Casentinesi" },
  { name: "Pratomagno", height: 1592, place: "Parco Foreste Casentinesi" },
  { name: "Monte Amiata", height: 1738, place: "Siena" }
];

function generateTableHead(table, data) {
  let thead = table.createTHead();
  let row = thead.insertRow();
  for (let key of data) {
    let th = document.createElement("th");
    let text = document.createTextNode(key);
    th.appendChild(text);
    row.appendChild(th);
  }
}
function generateTable(table, data) {
  for (let element of data) {
    let row = table.insertRow();
    for (key in element) {
      let cell = row.insertCell();
      let text = document.createTextNode(element[key]);
      cell.appendChild(text);
    }
  }
}
let table = document.querySelector("table");
let data = Object.keys(mountains[0]);
generateTableHead(table, data);
generateTable(table, mountains);
