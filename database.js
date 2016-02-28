var Firebase = require("firebase")

// Creat a connection to the Firebase db
var ref = new Firebase("https://DevTalk.firebaseio.com")

var myFirebaseRef = new Firebase("https://sweltering-inferno-344.firebaseio.com/");
ref.once("value", function(data){
  		console.log(data.val());
  		debugger
      })


$.ajax({
    url: 'file:///Users/Spencer/Code/SpartaHack/index.html',
    type: "post",
    dataType: "json",
    data: {
        json: JSON.stringify([
            {
            id: 1,
            firstName: "Peter",
            lastName: "Jhons"},
        {
            id: 2,
            firstName: "David",
            lastName: "Bowie"}
        ]),
        delay: 3
    },
    success: function(data, textStatus, jqXHR) {
        // since we are using jQuery, you don't need to parse response
        drawTable(data);
    }
});

function drawTable(data) {
    for (var i = 0; i < data.length; i++) {
        drawRow(data[i]);
    }
}

function drawRow(rowData) {
    var row = $("<tr />")
    $("#personDataTable").append(row); //this will append tr element to table... keep its reference for a while since we will add cels into it