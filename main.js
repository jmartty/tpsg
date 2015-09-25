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
    cylinder.setupModelData(20, 10);
    cylinder.setupIndexBuffer();
    cylinder.setupGLBuffers();

    cylinder2 = new Cylinder();
    cylinder2.create("cylinder2", "default");
    cylinder2.setupModelData(20, 10);
    cylinder2.setupIndexBuffer();
    cylinder2.setupGLBuffers();

    grid = new Grid();
    grid.create("grid", "default");
    grid.setupModelData(10, 10);
    grid.setupIndexBuffer();
    grid.setupGLBuffers();
    
    // Construimos la escena
    sceneRoot.attachChild(cylinder);
    cylinder.attachChild(cylinder2);
    cylinder.attachChild(grid);
    grid.translate([-0.5, -0.5, 0.0]);
    cylinder2.scale([0.5, 0.5, 0.5]);
    cylinder2.rotate(90, [0.0, 1.0, 0.0]);
    cylinder2.translate([-1.0, 0.0, 0.5]);

    // Draw
    //drawScene();
    requestAnimationFrame(drawScene);

}

// Funcion general de dibujado
function drawScene() {
    requestAnimationFrame(drawScene);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    cylinder.reset();
    cylinder.rotate(document.getElementById('degrees').value, [document.getElementById('x').value, document.getElementById('y').value, document.getElementById('z').value]);
    cylinder.translate([0.0, 1.5, 0.0]);
    cylinder.rotate(-document.getElementById('degrees').value, [document.getElementById('x').value, document.getElementById('y').value, document.getElementById('z').value]);
    sceneRoot.draw();
}
