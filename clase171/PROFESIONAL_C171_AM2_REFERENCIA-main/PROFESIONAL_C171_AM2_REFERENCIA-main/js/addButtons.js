AFRAME.registerComponent("create-buttons", {
  init: function() {
    // 1. Crea el botón
    var button1 = document.createElement("button");
    button1.innerHTML = "CALIFICAR";
    button1.setAttribute("id", "rating-button");
    button1.setAttribute("class", "btn btn-warning mr-3");

    // 2. Crea el botón
    var button2 = document.createElement("button");
    button2.innerHTML = "ORDENAR";
    button2.setAttribute("id", "order-button");
    button2.setAttribute("class", "btn btn-warning mr-4");

    // 2. Añádelo en cualquier lado
    var buttonDiv = document.getElementById("button-div");
    buttonDiv.appendChild(button1);
    buttonDiv.appendChild(button2);
  }
});
