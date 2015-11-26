//Variables globales
// Contexto webGL
var gl = null;
var canvas = null;
var programManager = null;
var camera = null;
var tick = 0;

// Funcion para inicializar el contexto webGL
function setupWebGL() {
    // Setup canvas
    canvas = document.getElementById("my-canvas");
    try{
        gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        if(!gl) {
            alert("Error: Your browser does not appear to support WebGL.");
            return;
        }
    }catch(e){
        alert("Error: canvas.getContext()");
    }
    // Other gl settings
   // gl.clearColor(0.1, 0.1, 0.2, 1.0);
    gl.clearColor(0.6, 1, 1, 1.0);

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);
    gl.viewport(0, 0, canvas.width, canvas.height);
}

// Escena
var sceneGraph = null;

function main() {
    // Setup webGL and canvas
    setupWebGL();
    // Load shaders and programs
    programManager = new ProgramManager();
    // Load camera
    camera = new Camera();
    // Add shaders from <script>
    programManager.addShader("default-vs");
    programManager.addShader("lighting-vs");
    programManager.addShader("default-fs");
    // Create programs with shaders
    programManager.addProgram("default", ["default-vs", "default-fs"]);
    programManager.addProgram("lighting", ["lighting-vs", "default-fs"]);

    // Setup de la escena
    sceneRoot = new SceneRoot();
	
	ferriswheel = new FerrisWheel();
	vueltamundo = new SceneNode();
	vueltamundo.create("vuelta",null);
	ferriswheel.createModel(vueltamundo);
	sceneRoot.attachChild(vueltamundo);


	flyingchairs = new FlyingChairs();
	sillas = new SceneNode();
	sillas.create("sillas", null);
	flyingchairs.createModel(sillas);
	sceneRoot.attachChild(sillas);

	
    // Dibujamos los ejes
    drawAxes(sceneRoot);

    // Un piso 
    base = new Grid();
    base.create("", "default");
    base.setupModelData(25, 25, [0, 0.8, 0.2]);
    base.setupIndexBuffer();
    base.setupGLBuffers();
    base.translate([1, 1, 0]);
    base.scale([80, 30, 1]);
    base.translate([-0.5, -0.5, -0.025]);
  //  base.draw_mode = gl.LINE_STRIP;
    sceneRoot.attachChild(base);
    
    
	rollercoaster = new RollerCoaster();
	montarusa = new SceneNode();
	montarusa.create("montarusa",null);
	rollercoaster.createModel(montarusa);
	sceneRoot.attachChild(montarusa);	
    
    // Draw
    requestAnimationFrame(drawScene);

}

function drawAxes(parent) {
    axes = new SceneNode();
    axes.create("axes", null);
    parent.attachChild(axes);

    axis_x = new Curve();
    axis_x.create("x", "default");
    axis_x.setupModelData(function(u){ return [u, 0, 0]; }, 2);
    axis_x.setupIndexBuffer();
    axis_x.setupGLBuffers();
    axes.attachChild(axis_x);

    axis_y = new Curve();
    axis_y.create("y", "default");
    axis_y.setupModelData(function(u){ return [0, u, 0]; }, 2);
    axis_y.setupIndexBuffer();
    axis_y.setupGLBuffers();
    axes.attachChild(axis_y);
    
    axis_z = new Curve();
    axis_z.create("z", "default");
    axis_z.setupModelData(function(u){ return [0, 0, u]; }, 2);
    axis_z.setupIndexBuffer();
    axis_z.setupGLBuffers();
    axes.attachChild(axis_z);

}

// Funcion general de dibujado
function drawScene() {
    requestAnimationFrame(drawScene);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	//posicionar juego sillas
	sillas.reset();
    sillas.translate([-8, -3, 0]);
    sillas.scale([5,5,5]);

	//posicionar vuelta al mundo
	vueltamundo.reset();
	vueltamundo.translate([9, -4, 0]);
	vueltamundo.rotate(45, [0,0,1]);
	vueltamundo.scale([1.5,1.5,1.5]);
	
	//posicionar montaña rusa
	montarusa.reset();
	//animacion
	tick += 0.5;
	ferriswheel.animate(tick); 
	flyingchairs.animate(tick);
	rollercoaster.animate(tick/2.5);
	
    // Update camera from form controls
    //camera.updateFromDocument();
    
    // Update viewmatrix
    programManager.updateViewMatrix(camera.getViewMatrix());

    sceneRoot.draw();
}

// Controles via teclado
document.addEventListener('keydown', function(event) {
    // W
    if (event.keyCode == 87) {
        camera.moveForward();
    // S
    }else if (event.keyCode == 83) {
        camera.moveBackward();
    // Left
    }else if (event.keyCode == 37) {
        camera.lookLeft();
    // A
    }else if (event.keyCode == 65) {
        camera.strafeLeft();
    // D
    }else if (event.keyCode == 68) {
        camera.strafeRight();
    // Right
    }else if (event.keyCode == 39) {
        camera.lookRight();
    // Look up
    }else if (event.keyCode == 38) {
        camera.lookUp();
    // Look down
    }else if (event.keyCode == 40) {
        camera.lookDown();
    }else if (event.keyCode == 67) {
        camera.cycle();
    }

}, true);

// Controles via mouse
mouseMove = function(event) {
    if(event.shiftKey) {
        if(event.movementX != 0) {
            camera.yaw(event.movementX);
        }
        if(event.movementY != 0) {
            camera.pitch(event.movementY);
        }
    }
}
