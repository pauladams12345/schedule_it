//Pulls table with reservation info from database.
//and calls function to create table on page.
let eventId = 173;

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
}

resvTable(eventId);
console.log("test");
