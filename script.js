const matterContainer = document.getElementById("matterContainer");
const shapeSize = document.getElementById("shapeSize");
const sizeLabel = document.getElementById("sizeLabel");
const square = document.getElementById("square");
const circle = document.getElementById("circle");
const colour = document.getElementById("colour");
const menuButton = document.getElementById("menuButton");
const shapeList = document.getElementById("shapeList");
const selectedInfo = document.getElementById("selectedInfo");
const selectedColour = document.getElementById("colourChange");
const selectedId = document.getElementById("showId");


let selected = undefined;
let wallThickness = 200;

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

// module aliases
var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite;

// create an engine
var engine = Engine.create();

// create a renderer
var render = Render.create({
    element: matterContainer ,
    engine: engine,
    options: {
        width: matterContainer.clientWidth,
        height: matterContainer.clientHeight,
        wireframes: false,
        background: "#212529"
    }
});

// create two boxes and a ground
let ground = Bodies.rectangle(matterContainer.clientWidth / 2, matterContainer.clientHeight + wallThickness / 2, matterContainer.clientWidth * 15, wallThickness, { 
    isStatic: true,
    render: {
        fillStyle: "#212529",
        strokeStyle: "#212529" 
    }
});
let leftWall = Bodies.rectangle(-wallThickness / 2, matterContainer.clientHeight / 2 , wallThickness, matterContainer.clientHeight * 15, { 
    isStatic: true,
    render: {
        fillStyle: "#212529",
        strokeStyle: "#212529" 
    } 
});
let rightWall = Bodies.rectangle(matterContainer.clientWidth + wallThickness / 2, matterContainer.clientHeight / 2, wallThickness, matterContainer.clientHeight * 15, { 
    isStatic: true,
    render: {
        fillStyle: "#212529",
        strokeStyle: "#212529" 
    } 
});

// add all of the bodies to the world
Composite.add(engine.world, [ground,leftWall,rightWall]);

for (let i = 0; i < 20; i++) {
    let x = getRandomInt(0,matterContainer.clientWidth)
    let y = getRandomInt(-500,0)
    let randomScale = getRandomArbitrary(1,2)
    let circle = Bodies.circle(x, y, 30 * randomScale);
    Composite.add(engine.world, [circle]);
}

let mouse = Matter.Mouse.create(render.canvas);
let mouseConstraint = Matter.MouseConstraint.create(engine, {
  mouse: mouse,
  constraint: {
    stiffness: 0.2,
    render: {
      visible: false
    }
  }
});

Composite.add(engine.world, mouseConstraint);

// run the renderer
Render.run(render);

// create runner
var runner = Runner.create();

// run the engine
Runner.run(runner, engine);

function handleResize(matterContainer){
    // set canvas size to new values
    render.canvas.width = matterContainer.clientWidth;
    render.canvas.height = matterContainer.clientHeight;

    // reposition ground
    Matter.Body.setPosition(
    ground,
    Matter.Vector.create(
        matterContainer.clientWidth / 2,
        matterContainer.clientHeight + wallThickness / 2
    )
    );
    
    // reposition right wall
    Matter.Body.setPosition(
    rightWall,
    Matter.Vector.create(
      matterContainer.clientWidth + wallThickness / 2,
      matterContainer.clientHeight / 2
    )
    );
    


    // Check if bodies outside bounds
    clearOutsideBounds();
}

let addShapeCheck = false;

function addShape(){
    if(addShapeCheck == true){
        let size = shapeSize.value;
        
        if(circle.checked == true){
            shape = Bodies.circle(mouse.absolute.x, mouse.absolute.y, size / 2,    {
                render: {
                    fillStyle: colour.value,
                }
            });
        }else{
            shape = Bodies.rectangle(mouse.absolute.x, mouse.absolute.y, size, size, {
                render: {
                    fillStyle: colour.value,
                }
            });
        }
        Composite.add(engine.world, [shape]);
    }
}

function toggleAddShape(){
    addShapeCheck = !addShapeCheck;
    shapeSize.disabled = !shapeSize.disabled;
    circle.disabled = !circle.disabled;
    square.disabled = !square.disabled;
    colour.disabled = !colour.disabled;
}

function toggleMoveShape(){
    if(mouseConstraint.collisionFilter.category == 1){
        mouseConstraint.collisionFilter.category = 0;
    }else{
        mouseConstraint.collisionFilter.category = 1;
    }
}

function updateSize(){
    sizeLabel.innerHTML = "Size: " + shapeSize.value;
}

function clearOutsideBounds(){
    let numberBodies = Matter.Composite.allBodies(engine.world).length;
    for (let i = 0; i < numberBodies; i++) {
        let x = Matter.Composite.allBodies(engine.world)[i].position.x;
        let y = Matter.Composite.allBodies(engine.world)[i].position.y;
        if(x > matterContainer.clientWidth + wallThickness || x < -wallThickness || y > matterContainer.clientHeight + wallThickness + 50){
            Composite.removeBody(engine.world,Matter.Composite.allBodies(engine.world)[i]);
            numberBodies = Matter.Composite.allBodies(engine.world).length;
            i = 0;
        }
    }

    numberBodies = Matter.Composite.allBodies(engine.world).length;
    shapeList.innerHTML = "";

    // Update list of shapes in menu
    for (let i = 0; i < numberBodies; i++) {
        if(i > 2){
            let li = document.createElement("li");
            li.innerHTML = `<a class='dropdown-item' href='#' onclick='selectBody(${Matter.Composite.allBodies(engine.world)[i].id})'>` + Matter.Composite.allBodies(engine.world)[i].label + " " + Matter.Composite.allBodies(engine.world)[i].id + "</a>";
            shapeList.appendChild(li);
        }
    }
}

function deleteSelection(){
    let numberBodies = Matter.Composite.allBodies(engine.world).length;

    for (let i = 0; i < numberBodies; i++) {
        if(selected.id == Matter.Composite.allBodies(engine.world)[i].id){
            Composite.removeBody(engine.world,Matter.Composite.allBodies(engine.world)[i]);
            break
        }
    }
    selected = undefined;
    toggleSelected();
    clearOutsideBounds();
}

function selectBody(id){
    let numberBodies = Matter.Composite.allBodies(engine.world).length;
    for (let i = 0; i < numberBodies; i++) {
        if(id == Matter.Composite.allBodies(engine.world)[i].id){
            selected = Matter.Composite.allBodies(engine.world)[i];
            break
        }
    }

    toggleSelected()
}


function clickBody(){
    selected = Matter.Query.point(Matter.Composite.allBodies(engine.world),{x: mouse.absolute.x, y: mouse.absolute.y})[0];
    toggleSelected()
}

function toggleSelected(){
    if(selected !== undefined){
        selectedInfo.style.visibility = "visible";
        selectedColour.value = selected.render.fillStyle;
        selectedId.innerText = selected.label + " " + selected.id;
        outlineSelected();
    }else{
        selectedInfo.style.visibility = "hidden";
        selectedColour.value = "#000000";
        selectedId.innerText = "";
        outlineSelected();
    }
}

function changeSelectedColour(){
    let numberBodies = Matter.Composite.allBodies(engine.world).length;
    for (let i = 0; i < numberBodies; i++) {
        if(selected.id == Matter.Composite.allBodies(engine.world)[i].id){
            Matter.Composite.allBodies(engine.world)[i].render.fillStyle = selectedColour.value;
            break
        }
    }
}

function outlineSelected(){
    let numberBodies = Matter.Composite.allBodies(engine.world).length;
    for (let i = 0; i < numberBodies; i++) {
        if(selected !== undefined){
            if(selected.id == Matter.Composite.allBodies(engine.world)[i].id){
                Matter.Composite.allBodies(engine.world)[i].render.lineWidth = 10;
                Matter.Composite.allBodies(engine.world)[i].render.strokeStyle = "#FFFF00";
            }else{
                Matter.Composite.allBodies(engine.world)[i].render.lineWidth = 0;
            }
        }else{
            Matter.Composite.allBodies(engine.world)[i].render.lineWidth = 0;
        }
    }
}



window.addEventListener("resize", () => handleResize(matterContainer))
matterContainer.addEventListener("mousedown", () => addShape())
matterContainer.addEventListener("mousedown", () => clickBody())
matterContainer.addEventListener("touchstart", () => addShape())
matterContainer.addEventListener("touchstart", () => clickBody())
shapeSize.addEventListener("input",() => updateSize());
menuButton.addEventListener("mousedown", () => clearOutsideBounds())
selectedColour.addEventListener("input",() => changeSelectedColour());


