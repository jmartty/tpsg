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
    es = new ExtrusionSurface();
    es.create("es", "default");
    es.setupModelData([[0.1, 0.1], [-0.1, 0.1], [-0.1, -0.1], [0.1, -0.1]],
                      function(u){ return [2*u, Math.sin(u*Math.PI*2), 0]; },
                      function(u){ return [2, Math.cos(u*Math.PI*2), 0]; },
                      100);
    //es.draw_mode = gl.LINE_STRIP;
    es.setupIndexBuffer();
    es.setupGLBuffers();
    
    // Construimos la escena
    sceneRoot.attachChild(es);

    // Dibujamos los ejes
    axis_x = new Curve();
    axis_x.create("x", "default");
    axis_x.setupModelData(function(u){ return [u, 0, 0]; }, 2);
    axis_x.setupIndexBuffer();
    axis_x.setupGLBuffers();
    sceneRoot.attachChild(axis_x);

    axis_y = new Curve();
    axis_y.create("y", "default");
    axis_y.setupModelData(function(u){ return [0, u, 0]; }, 2);
    axis_y.setupIndexBuffer();
    axis_y.setupGLBuffers();
    sceneRoot.attachChild(axis_y);
    
    axis_z = new Curve();
    axis_z.create("z", "default");
    axis_z.setupModelData(function(u){ return [0, 0, u]; }, 2);
    axis_z.setupIndexBuffer();
    axis_z.setupGLBuffers();
    sceneRoot.attachChild(axis_z);
    
    // Draw
    //drawScene();
    requestAnimationFrame(drawScene);

}

// Funcion general de dibujado
function drawScene() {
    requestAnimationFrame(drawScene);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    es.reset();
    es.rotate(document.getElementById('degrees').value, [document.getElementById('x').value, document.getElementById('y').value, document.getElementById('z').value]);
    sceneRoot.draw();
}
