var numEmails = 0;
validateForm();
document.getElementById('addEmailsButton').addEventListener('click', splitEmails);

// Disable form submissions if there are invalid fields
// Adapted from https://getbootstrap.com/docs/4.0/components/forms/
function validateForm() {
   window.addEventListener('load', function() {
       // Fetch all the forms we want to apply custom Bootstrap validation styles to
       var forms = document.getElementsByClassName('needs-validation');
       // Loop over them and prevent submission
       var validation = Array.prototype.filter.call(forms, function(form) {
           form.addEventListener('submit', function(event) {
               if (form.checkValidity() === false) {
                 event.preventDefault();
                 event.stopPropagation();
               }
               form.classList.add('was-validated');
           }, false);
       });
   }, false);
}

// Extract email addresses from textarea, create a separate email input
// for each, and do input validation
function splitEmails(event) {

  // Get emails from textarea
  var allEmails = document.getElementById('emailAddresses').value;  // extract emails
  if ( allEmails.length == 0 ) {
    return;
  }
  var splitEmails = allEmails.split(/\s*,\s*|\s+/);     // split emails into separate strings
  document.getElementById('emailAddresses').value = ''; // delete text from textarea

  // Create an email input and delete button for each email address
  for (var email of splitEmails) {

    if (email == "") {
      continue;
    }

    numEmails++;
    var newInput = createEmailInput(email, numEmails)   // create input
    var newDeleteButton = createDeleteButton();         // create delete button
    bindDelete(newInput, newDeleteButton);              // bind delete button to input

    if ( newInput.checkValidity() ) {                   // do initial input validation
      newInput.classList.add('is-valid');
    } else {
      newInput.classList.add('is-invalid');
    }

    newInput.addEventListener('blur', validateEmail);   // do subsequent validation on blur

    appendInputAndButton(newInput, newDeleteButton);    // add to document

  }
};

// Return an email input with value matching the 1st argument
function createEmailInput(email, inputNumber) {
  var input = document.createElement("input");

  input.setAttribute('type', 'email');
  input.setAttribute('class', 'form-control w-100');
  input.setAttribute('name', 'emails');
  input.setAttribute('id', 'email' + inputNumber);

  input.value = email;

  return input;
};

// Returns a button for deleting an email input
function createDeleteButton() {
  var button = document.createElement("button");

  button.setAttribute('type', 'button');
  button.setAttribute('class', 'btn btn-sm btn-danger mx-2');
  button.setAttribute('id', 'emailDelete' + numEmails);
  button.textContent = 'Delete';

  return button;
};

// Checks if an email input's value is valid and sets formatting appropriately
function validateEmail(event) {
    // Add dynamic input validation
  if ( this.checkValidity() ) {
    this.classList.remove('is-invalid');
    this.classList.add('is-valid');
  }
  else {
    this.classList.add('is-valid');
    this.classList.add('is-invalid');
  }
}

// Appends the given email input and button to the document
function appendInputAndButton(input, button) {
    // Append row and column for new input and append to document
    var row = document.createElement("div");
    row.setAttribute('class', 'row')
    var col = document.createElement("div");
    col.setAttribute('class', 'col-12 form-inline d-flex');
    var div = document.createElement("div");
    div.setAttribute('style', 'display: flex; flex-grow: 1;')

    div.appendChild(input)
    col.appendChild(div);
    col.appendChild(button);
    row.appendChild(col);
    document.getElementById('emailsDiv').appendChild(row);
};

// Sets the supplied button to delete the corresponding
// input (and itself) upon being clicked
function bindDelete(input, button) {
  button.addEventListener('click', function(event) {
    input.remove();
    button.remove();
  });
};