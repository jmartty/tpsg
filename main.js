//Variables globales
// Contexto webGL
var gl = null;
var canvas = null;
var programManager = null;

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
var cilinder = null;
var cilinder2 = null;

function main() {
    // Setup webGL and canvas
    setupWebGL();
    // Load shaders and programs
    programManager = new ProgramManager();
    // Add shaders from <script>
    programManager.addShader("default-vs");
    programManager.addShader("default-fs");
    // Create programs with shaders
    programManager.addProgram("default", ["default-vs", "default-fs"]);
    // Enable default program
    programManager.useProgram("default");

    // Setup de la escena
    sceneRoot = new SceneRoot();

    // Creacion de instancias de modelos
    cylinder = new Cylinder();
    cylinder.create("cylinder", "default");
    cylinder.setupModelData();
    cylinder.setupIndexBuffer();
    cylinder.setupGLBuffers();

    cylinder2 = new Cylinder();
    cylinder2.create("cylinder2", "default");
    cylinder2.setupModelData();
    cylinder2.setupIndexBuffer();
    cylinder2.setupGLBuffers();

    // Construimos la escena
    sceneRoot.attach(cylinder);
    cylinder.attach(cylinder2);
    cylinder2.scale([0.5, 0.5, 0.5]);
    cylinder2.rotate(90, [0.0, 1.0, 0.0]);
    cylinder2.translate([-20.0, 0.0, 0.0]);

    // Draw
    //drawScene();
    setInterval(drawScene, 16);

}

// Funcion general de dibujado
function drawScene() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    cylinder.rotate(1.0, [document.getElementById('x').value, document.getElementById('y').value, document.getElementById('z').value]);
    sceneRoot.draw();
}
