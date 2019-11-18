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

let createResvTable = async function(table){
  console.log("test");
}
