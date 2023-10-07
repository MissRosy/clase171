//2.- Declarar variable para guardar el numero de mesa
var tableNumber = null;

AFRAME.registerComponent("markerhandler", {
  init: async function () {
    
    //Obtener el número de mesa
    if (tableNumber === null) {
      this.askTableNumber();
    }

    //Obtener la colección de platillos
    var dishes = await this.getDishes();
    console.log(tableNumber)
    //Evento makerFound
    this.el.addEventListener("markerFound", () => {
      //Paso 5.- del cuaderno, checar si cuando se encontró el marcador el numero de mesa ya no es null
      if (tableNumber !== null) {
        var markerId = this.el.id;
        this.handleMarkerFound(dishes, markerId);
      }
    });
    //Evento markerLost
    this.el.addEventListener("markerLost", () => {
      this.handleMarkerLost();
    });
  },
  //1.- Crear la función para mostrar la alerta de bienvenida
  askTableNumber: function () {
    var iconUrl = "https://raw.githubusercontent.com/whitehatjr/menu-card-app/main/hunger.png";
    swal({
      title: "¡Bienvenido a 'El Antojo'!",
      icon: iconUrl,
      content: {
        element: "input",
        attributes: {
          placeholder: "Escribe el número de tu mesa",
          type: "number",
          min: 1
        }
      },
      //Para que cuando le den clik al boton de ok se cierre
      closeOnClickOutside: false,
      //Se guarda lo que el usuario escribio en la variable declarada hasta arriba
    }).then(inputValue => {
      tableNumber = inputValue;
    });
  },

  handleMarkerFound: function (dishes, markerId) {
    // Obtener el día
    var todaysDate = new Date();
    var todaysDay = todaysDate.getDay();

    // De domingo a sábado: 0 - 6
    var days = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado"
    ];

    //Obtener el platillo según su ID 
    var dish = dishes.filter(dish => dish.id === markerId)[0];

    //Verificar si el platillo está disponible en hoy
    if (!dish.unavailable_days.includes(days[todaysDay])) {
      swal({
        icon: "warning",
        title: dish.nombre.toUpperCase(),
        text: "¡Este platillo no está disponible hoy!",
        timer: 2500,
        buttons: false
      });
    } else {
      //Cambiar el tamaño del modelo a su escala inicial
      var model = document.querySelector(`#model-${dish.id}`);
      model.setAttribute("position", dish.model_geometry.position);
      model.setAttribute("rotation", dish.model_geometry.rotation);
      model.setAttribute("scale", dish.model_geometry.scale);

      //Actualizar la VISIBILIDAD de la escena de (MODELO, HOJA DE INGREDIENTES E IMAGEN PARA PRECIO)      
      model.setAttribute("visible", true);

      var ingredientsContainer = document.querySelector(`#main-plane-${dish.id}`);
      ingredientsContainer.setAttribute("visible", true);

      var priceplane = document.querySelector(`#price-plane-${dish.id}`);
      priceplane.setAttribute("visible", true)

      //Cambiar la visibilidad del botón div
      var buttonDiv = document.getElementById("button-div");
      buttonDiv.style.display = "flex";

      var ratingButton = document.getElementById("rating-button");
      var orderButtton = document.getElementById("order-button");
      
      //8.- Checar si ya hay numero de mesa
      if (tableNumber != null) {
        //Usar eventos de clic
        ratingButton.addEventListener("click", function () {
          swal({
            icon: "warning",
            title: "Calificar platillo",
            text: "Procesando calificación"
          });
        });

        orderButtton.addEventListener("click", () => {
          //Variable para el numero de mesa concatenado
          var tNumber;
          //Si su mesa es menor que 9 ? entonces la variable de arriba quedaría como T01 o T02 etc : quedaría como T10
          tableNumber <= 9 ? (tNumber = `T0${tableNumber}`) : `T${tableNumber}`;
          //Se manda llamar la función con el numero de mesa y el platillo
          this.handleOrder(tNumber, dish);
          
          swal({
            icon: "https://i.imgur.com/4NZ6uLY.jpg",
            title: "¡Gracias por tu orden!",
            text: "¡Recibirás tu orden pronto!",
            timer: 2000,
            buttons: false
          });
        });
      }
    }
  },
  //7.- Función para guardar orden en la base(numero de mesa, platillo)
  handleOrder: function (tNumber, dish) {
    // Leer los detalles de la orden para la mesa actual
    firebase
      .firestore()
      .collection("tables")
      .doc(tNumber)
      .get()
      .then(doc => {
        var details = doc.data();

        //Checar si para esa mesa, en la opción de ordenes ya esta agregado ese platillo
        if (details["current_orders"][dish.id]) {
          // Incrementar la cantidad actual de ese platillo
          details["current_orders"][dish.id]["quantity"] += 1;

          //Cantidad del platillo(ejem: 1 o 2 pizzas) agregado en el campo quantity
          var currentQuantity = details["current_orders"][dish.id]["quantity"];

          //Calcular el subtotal segun el numero del mismo platillo y su precio y agregar el campo subtotal
          details["current_orders"][dish.id]["subtotal"] =
            currentQuantity * dish.price;
        } 
        //De lo contrario añadir los campos de item, price, cantidad y subtotal para el platillo nuevo
        else {
          details["current_orders"][dish.id] = {
            item: dish.nombre,
            price: dish.price,
            quantity: 1,
            subtotal: dish.price * 1
          };
        }
        //Hacer la suma para el pago total
        details.total_bill += dish.price;

        //Actualizar la base de datos
        firebase
          .firestore()
          .collection("tables")
          .doc(doc.id)
          .update(details);
      });
  },
  //Función para obtener la colección de platillos desde la base de datos
  getDishes: async function () {
    return await firebase
      .firestore()
      .collection("dishes")
      .get()
      .then(snap => {
        return snap.docs.map(doc => doc.data());
      });
  },
  handleMarkerLost: function () {
    // Cambiar la visibilidad del botón div
    var buttonDiv = document.getElementById("button-div");
    buttonDiv.style.display = "none";
  }
});
