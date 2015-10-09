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
    cone = new SurfaceOfRevolution();
    cone.create("rs", "default");
    cone.setupModelData(10, 15, function(u){ return u; });
    cone.setupIndexBuffer();
    cone.setupGLBuffers();
    
    top_cap = new Circle();
    top_cap.create("circle", "default");
    top_cap.setupModelData(10);
    top_cap.setupIndexBuffer();
    top_cap.setupGLBuffers();
    top_cap.translate([0.0, 0.0, 1.0]);
    
    // Construimos la escena
    sceneRoot.attachChild(cone);
    cone.attachChild(top_cap);

    // Draw
    //drawScene();
    requestAnimationFrame(drawScene);

}

// Funcion general de dibujado
function drawScene() {
    requestAnimationFrame(drawScene);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    cone.reset();
    cone.rotate(document.getElementById('degrees').value, [document.getElementById('x').value, document.getElementById('y').value, document.getElementById('z').value]);
    sceneRoot.draw();
}
