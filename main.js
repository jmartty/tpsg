//Variables globales
// Contexto webGL
var gl = null;
var canvas = null;
var programManager = null;
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
    gl.clearColor(0.1, 0.1, 0.2, 1.0);
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
    // Add shaders from <script>
    programManager.addShader("default-vs");
    programManager.addShader("lighting-vs");
    programManager.addShader("default-fs");
    // Create programs with shaders
    programManager.addProgram("default", ["default-vs", "default-fs"]);
    programManager.addProgram("lighting", ["lighting-vs", "default-fs"]);

    // Setup de la escena
    sceneRoot = new SceneRoot();
	
/*	ferriswheel = new FerrisWheel();
	vueltamundo = new SceneNode();
	vueltamundo.create("vuelta",null);
	ferriswheel.createModel(vueltamundo);
	sceneRoot.attachChild(vueltamundo);
*/
	objeto = new SceneNode();
	objeto.create("silla", null);
	createCar("silla", objeto, [ 1, 0, 0 ]);
	sceneRoot.attachChild(objeto);
	
    // Dibujamos los ejes
    drawAxes(sceneRoot);

    // Draw
    //drawScene();
    requestAnimationFrame(drawScene);

}

function drawAxes(parent) {
    axes = new SceneNode();
    axes.create("axes", null);
    parent.attachChild(axes);
    // Un escalado para mostrar que se funciona
    axes.scale([2.0, 2.0, 0.5]);

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


    // Draw
    drawScene();
    //requestAnimationFrame(drawScene);

}

// Funcion general de dibujado
function drawScene() {
    requestAnimationFrame(drawScene);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	objeto.reset();
	objeto.scale([3,3,3]);
    objeto.rotate(document.getElementById('degrees').value, [document.getElementById('x').value, document.getElementById('y').value, document.getElementById('z').value]);

/*	vueltamundo.reset();
	vueltamundo.scale([0.5, 0.5, 0.5]); 
	vueltamundo.translate([0.5, 0.5, -0.5]);

    vueltamundo.rotate(document.getElementById('degrees').value, [document.getElementById('x').value, document.getElementById('y').value, document.getElementById('z').value]);
	tick += 0.5;
	ferriswheel.animate(tick); */
    sceneRoot.draw();
}
