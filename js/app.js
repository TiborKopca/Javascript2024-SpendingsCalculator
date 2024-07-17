/*-------------------------------------*/
/* CONSTANTS & VARIABLES */
/*-------------------------------------*/
const formulario = document.getElementById("agregar-gasto");
const gastosListado = document.querySelector("#gastos ul");
const inputBudget = document.querySelector("#budget");
const btnEnterData = document.querySelector("#btn-enterData");
//GLOBAL VARIABLE TO STORE THE PRESUPUESTO DATA
let presupuesto;

/*-------------------------------------*/
/* EVENTS */
/*-------------------------------------*/
eventListeners();
function eventListeners() {
  //ON ENTER KEY PRESS - READ DATA FROM INPUT
  inputBudget.addEventListener("keypress", function (e) {
    if (e.keyCode === 13) {
      readInput();
      //preguntarPresupuesto();
    }
  });
  //ON CLICK OF THE BUTTON - READ DATA FROM INPUT
  btnEnterData.addEventListener("click", readInput);

  //ON FORM SUBMIT - VALIDATE DATA
  formulario.addEventListener("submit", agregarGasto);
  //DELETES THE ELEMENT FROM THE LIST ON CLICK OF THE BUTTON
  gastosListado.addEventListener("click", eliminarGasto);
}

/*-------------------------------------*/
/* CLASSES */
/*-------------------------------------*/
//HANDLER/CALCULATOR OF THE EXPENSES
class Presupuesto {
  constructor(presupuesto) {
    this.presupuesto = Number(presupuesto); //this value wont be changed
    this.restante = Number(presupuesto); //this value will be changed by subtracting the expenses
    this.gastos = [];
  }
  nuevoGasto(gasto) {
    //Spendings are array of objects, we need to use spread operator
    this.gastos = [...this.gastos, gasto];
    this.calcularRestante();
  }
  //DELETES AN ELEMENT FROM THE ARRAY BY ID
  eliminarGasto(id) {
    this.gastos = this.gastos.filter((gasto) => gasto.id.toString() !== id);
    this.calcularRestante();
  }
  //CALCULATES THE REST OF THE BUDGET
  calcularRestante() {
    const gastado = this.gastos.reduce(
      //it counts every expense in the array, and sums it up in a variable 'total', starts with position 0 
      (total, gasto) => total + gasto.cantidad,
      0
    );
    //the rest of the budget is the difference between the total and the expenses
    this.restante = this.presupuesto - gastado;
  }
}

//RENDER CONTROLLER OF THE H   TML
class UI {
  //RENDER THE INPUT DATA TO THE DOM
  insertarPresupuesto(cantidad) {
    document.querySelector("#total").textContent = cantidad.presupuesto;
    document.querySelector("#restante").textContent = cantidad.restante;
  }
  //RENDERS AN ERROR MESSAGE TO THE DOM * 2 PARAMETERS: message and type
  imprimirAlerta(mensaje, tipo) {
    const divMensaje = document.createElement("div");
    divMensaje.classList.add("text-center", "alert"); //alert ==> bootstrap class

    //TYPE ERROR ==> ADD A CLASS
    if (tipo === "error") {
      divMensaje.classList.add("alert-danger");
    } else {
      divMensaje.classList.add("alert-success");
    }
    //APPEND THE MESSAGE
    divMensaje.textContent = mensaje;
    //INJECT THE MESSAGE IN THE DOM
    document.querySelector(".primario").insertBefore(divMensaje, formulario);
    //AFTER 3 SECONDS REMOVE THE ALERT
    setTimeout(() => {
        // divMensaje.remove();
      document.querySelector(".primario .alert").remove();
    }, 3000);
  }

  //INSERTS THE EXPENSES TO THE LIST
  agregarGastoListado(gastos) {
    //CLEAR PREVIOUS LIST
    this.limpiarHTML();

    //FOR ALL ARRAY OBJECTS, DESTRUCTURE THE DATA AND CREATE HTML ELEMENTS
    gastos.forEach((gasto) => {
      const { nombre, cantidad, id } = gasto;
      //CREATE A LI ELEMENT
      const nuevoGasto = document.createElement("li");
      nuevoGasto.className =
        "list-group-item d-flex justify-content-between align-items-center";
        //EACH ELEMENT HAS A DATASET WITH THE ID OF THE TIMESTAMP
      nuevoGasto.dataset.id = id;
      //INSERT THE EXPENSE + BOOTSTRAP CLASSES
      nuevoGasto.innerHTML = `
                ${nombre}
                <span class="badge badge-primary badge-pill">${cantidad}€</span>
            `;

      //CREATE A BUTTON TO DELETE THE EXPENSE
      const btnBorrar = document.createElement("button");
      btnBorrar.classList.add("btn", "btn-danger", "borrar-gasto");
      btnBorrar.textContent = "Delete";
      nuevoGasto.appendChild(btnBorrar);

      //INSERT THE EXPENSE IN THE DOM LIST(<ul>)
      gastosListado.appendChild(nuevoGasto);
    });
  }

  //PRINTS THE REST OF THE BUDGET TO THE DOM
  actualizarRestante(restante) {
    document.querySelector("span#restante").textContent = restante;
  }

  //CHANGE THE COLOR OF THE BUDGET IF IT DROPS BELOW SOME QUANTITY
  comprobarPresupuesto(presupuestoObj) {
    // console.log(presupuestoObj);
    const { presupuesto, restante } = presupuestoObj;
    const restanteDiv = document.querySelector(".restante");
    // console.log(restante);
    // console.log(presupuesto);

    //CHECK IF BUDEGET DROPS BELOW 25%
    if (presupuesto / 4 > restante) {
      restanteDiv.classList.remove("alert-success", "alert-warning");
      restanteDiv.classList.add("alert-danger");
      //CHECK IF BUDGET DROPS BELOW 50%
    } else if (presupuesto / 2 > restante) {
      restanteDiv.classList.remove("alert-success");
      restanteDiv.classList.add("alert-warning");
    } else {
      //OTHERWISE, THE BUDGET IS OK
      restanteDiv.classList.remove("alert-danger", "alert-warning");
      restanteDiv.classList.add("alert-success");
    }

    //DISABLE THE SUBMIT BUTTON IF THE BUDGET FALLS TO ZERO
    if (restante <= 0) {
      ui.imprimirAlerta("The budget has been exceeded", "error");
      formulario.querySelector('button[type="submit"]').disabled = true;
    }
  }
  //CLEARS THE LIST - children of the <ul> when the new BUDGET is created
  limpiarHTML() {
    while (gastosListado.firstChild) {
      gastosListado.removeChild(gastosListado.firstChild);
    }
  }
}

//INSTANCE OF THE UI CLASS - needs to be created after the UI class
const ui = new UI();

/*-------------------------------------*/
/* FUNCTIONS */
/*-------------------------------------*/
function readInput() {
  const inputField = document.querySelector("#budget");
  //SET THE FORMAT OF THE INPUT TO 2 DECIMALS
  let presupuestoUsuario = parseFloat(inputField.value).toFixed(2);
  //CONVERT TO NUMBER
  presupuestoUsuario = Number(presupuestoUsuario);
  //CHECK IF THE VALUE IS VALID, if not reload the page
  if (
    presupuestoUsuario === "" ||
    presupuestoUsuario === null ||
    isNaN(presupuestoUsuario) ||
    presupuestoUsuario <= 0
  ) {
    window.location.reload();
  }

  //VALID DATA ENTERED ==> CREATE INSTANCE OF A CLASS + pass the data
  presupuesto = new Presupuesto(presupuestoUsuario);
  console.log(presupuesto);

  //INJECT THE DATA IN THE HTML
  ui.insertarPresupuesto(presupuesto);

  //CLEAR INPUT
  inputField.value = "";
}

//FORM DATA VALIDATION - INPUT ENTERED TO THE FORM
function agregarGasto(e) {
  e.preventDefault();

  //READ DATA FROM THE FORM
  const nombre = document.querySelector("#gasto").value;
  const cantidad = Number(document.querySelector("#cantidad").value);

  //EMPTY FIELDS CHECK
  if (nombre === "" || cantidad === "") {
    //ERROR EMPTY FIELDS = two parameters: message and type
    ui.imprimirAlerta("Both fields are required", "error");
  } else if (cantidad <= 0 || isNaN(cantidad)) {
    //ERROR INVALID VALUE = two parameters: message and type
    ui.imprimirAlerta("Quantity is invalid", "error");
  } else {
    //NO ERROR = CREATE OBJECT LITERAL + pass the data
    const gasto = { nombre, cantidad, id: Date.now() };
    //ADD NEW EXPENSE TO THE INSTANCE
    presupuesto.nuevoGasto(gasto);

    //INSERT THE MESSAGE IN THE DOM
    ui.imprimirAlerta("Data added correctly", "correcto");

    //FILL THE OBJECT LITERAL WITH INPUT DATA - EVERY NEW INSTANCE OF EXPENSE
    const { gastos } = presupuesto;
    // console.log(gastos);

    //INSERTS THE EXPENSES IN THE LIST, with a specific expense and delete button
    ui.agregarGastoListado(gastos);

    //CHANGES THE CLASS/COLOR OF THE ALERT
    ui.comprobarPresupuesto(presupuesto);

    //OPOSITE OF DESCTURCTURE, put the value from the input fields, updating the object "presupuesto" 
    const { restante } = presupuesto;

    //PRINT AN UPDATE TO THE DOM
    ui.actualizarRestante(restante);

    //RESET THE FORM AFTER ADDING A NEW EXPENSE
    formulario.reset();
  }
}
//DELETES THE ELEMENT FROM THE LIST ON CLICK OF THE BUTTON - THE TARGET IS THE PARENT ELEMENT OF THE BUTTON
function eliminarGasto(e) {
  if (e.target.classList.contains("borrar-gasto")) {
    //GET THE DATASET DATA(ID)
    const { id } = e.target.parentElement.dataset;
    //calling class method
    presupuesto.eliminarGasto(id);
     //CHANGES THE CLASS/COLOR OF THE ALERT
    ui.comprobarPresupuesto(presupuesto);

    //PASS THE BUDGET TO THE REFRESH AND UPDATE DOM
    const { restante } = presupuesto;
    ui.actualizarRestante(restante);

    //DELETE FROM THE DOM
    e.target.parentElement.remove();
  }
}
