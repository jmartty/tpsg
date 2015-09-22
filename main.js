var gl = null;
var canvas = null;
var programManager = null;
var mMatrix = mat4.create();
var pMatrix = mat4.create();
var vMatrix = mat4.create();
var my_grid = null;

function ProgramManager() { 
    // Attribs
    this.programs = [];
    this.shaders = [];
    this.active = null;
    // Methods
    // Agregar y compilar un shader
    this.addShader = function(shaderid) {
        
        // Verificamos que no exista
        if(shaderid in this.shaders) {
            alert("Shader `" + shaderid + "` already exists!");
            return;
        }
        
        var shaderScript, src, currentChild, shader;

        // Obtenemos el elemento <script> que contiene el código fuente del shader
        shaderScript = document.getElementById(shaderid);
        if(!shaderScript) {
            alert("Elem `" + shaderid + "` not found");
            return null;
        }
        // Extraemos el contenido de texto del <script>
        src = "";
        currentChild = shaderScript.firstChild;
        while(currentChild) {
            if (currentChild.nodeType == currentChild.TEXT_NODE)
                src += currentChild.textContent;
            currentChild = currentChild.nextSibling;
        }
        // Creamos un shader WebGL según el atributo type del <script>
        if(shaderScript.type == "x-shader/x-fragment") {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        }else if(shaderScript.type == "x-shader/x-vertex") {
            shader = gl.createShader(gl.VERTEX_SHADER);
        }else{
            alert("Missing or invalid shader type");
            return;
        }
        // Cargamos el fuente y compilamos
        gl.shaderSource(shader, src);
        gl.compileShader(shader);  
        // Chequeamos y reportamos si hubo algún error.
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {  
            alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
            return;
        }
        // Cargamos el shader a la lista
        this.shaders[shaderid] = {}
        this.shaders[shaderid].id = shaderid;
        this.shaders[shaderid].shader = shader;
        
    }
    // Agregar y compilar un programa
    this.addProgram = function(programid, shaders) {
        this.programs[programid] = {}
        // Store program data
        this.programs[programid].id = programid;
        this.programs[programid].shaders = shaders;
        // Create program and attach+link
        this.programs[programid].program = gl.createProgram();
        shaders.forEach(function(s) {
            gl.attachShader(this.programs[programid].program, this.shaders[s].shader);
        }, this);
        gl.linkProgram(this.programs[programid].program);
        // Chequeamos y reportamos si hubo algún error.
        if(!gl.getProgramParameter(this.programs[programid].program, gl.LINK_STATUS)) {
          alert("Unable to initialize the shader program: " + gl.getProgramInfoLog(this.programs[programid].program));
          return null;
        }
        
    }
    // Activar un programa
    this.useProgram = function(program) {
        if(!(program in this.programs)) {
            alert("Program `" + program + "` not found!");
            return;
        }
        // Activar solo si no es el actual
        if(this.active != this.programs[program].program) {
            gl.useProgram(this.programs[program].program);
            this.active = this.programs[program].program;
        }
    }
} 


////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
//
// OBJETO VERTEX-GRID
// Definimos un constructor para el objeto VertexGrid
function VertexGrid (_cols, _rows) {
    if(_cols < 2 || _rows < 2) {
        alert("Invalid grid size");
        return null;
    }
    
    this.cols = _cols;
    this.rows = _rows;
    this.num_vertices = this.cols * this.rows;

    this.position_buffer = null;
    this.color_buffer = null;
    this.index_buffer = null;
    
    this.webgl_position_buffer = null;
    this.webgl_color_buffer = null;
    this.webgl_index_buffer = null;

    this.createIndexBuffer = function() {
        this.index_buffer = [];
        offset = 0;
        for(y = 0; y < this.rows-1; y++) {
            // Degenerate begin: repeat first vertex
            if (y > 0) {
                this.index_buffer[offset++] = y * this.cols;
            }

            // Draw one strip
            for (x = 0; x < this.cols; x++) {
                this.index_buffer[offset++] = (y * this.cols) + x;
                this.index_buffer[offset++] = ((y+1) * this.cols) + x;
            }

            // Degenerate end: repeat last vertex
            if (y < this.rows-2) {
                this.index_buffer[offset++] = ((y+1) * this.cols) + this.cols-1;
            }
        }
        //console.log(this.index_buffer);
    }
    
    // Esta función inicializa el position_buffer y el color buffer de forma de 
    // crear un plano de color gris que se extiende sobre el plano XY, con Z=0
    // El plano se genera centrado en el origen.
    // El propósito de esta función es a modo de ejemplo de como inicializar y cargar
    // los buffers de las posiciones y el color para cada vértice.
    this.createUniformPlaneGrid = function() {

        this.position_buffer = [];
        this.color_buffer = [];

        
        for (j = 0.0;j < this.rows; j++) {
            for (i = 0.0;i < this.cols; i++) { 
               // Para cada vértice definimos su posición
               // como coordenada (x, y, z=0)
               this.position_buffer.push(5.0*Math.cos(2.0*Math.PI*i/(this.cols-1)));
               this.position_buffer.push(5.0*Math.sin(2.0*Math.PI*i/(this.cols-1)));
               this.position_buffer.push(j);

               // Para cada vértice definimos su color
               this.color_buffer.push(i/this.cols);
               this.color_buffer.push(j/this.rows);
               this.color_buffer.push(0.5);
                                      
           };
        };
        //console.log(this.position_buffer);
    }

    // Esta función crea e incializa los buffers dentro del pipeline para luego
    // utlizarlos a la hora de renderizar.
    this.setupWebGLBuffers = function() {

        this.webgl_position_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_position_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.position_buffer), gl.STATIC_DRAW);

        this.webgl_color_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_color_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.color_buffer), gl.STATIC_DRAW);   

        this.webgl_index_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.webgl_index_buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.index_buffer), gl.STATIC_DRAW);
    }

    this.drawVertexGrid = function() {

        var vertexPositionAttribute = gl.getAttribLocation(programManager.active, "aVertexPosition");
        gl.enableVertexAttribArray(vertexPositionAttribute);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_position_buffer);
        gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

        var vertexColorAttribute = gl.getAttribLocation(programManager.active, "aVertexColor");
        gl.enableVertexAttribArray(vertexColorAttribute);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_color_buffer);
        gl.vertexAttribPointer(vertexColorAttribute, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.webgl_index_buffer);

        gl.drawElements(gl.TRIANGLE_STRIP, this.index_buffer.length, gl.UNSIGNED_SHORT, 0);

    }
}
//
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////

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

function drawScene() {
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var u_proj_matrix = gl.getUniformLocation(programManager.active, "uProjectionMatrix");
    mat4.perspective(pMatrix, Math.PI/4, canvas.width/canvas.height, 0.1, 100.0);
    gl.uniformMatrix4fv(u_proj_matrix, false, pMatrix);

    var u_view_matrix = gl.getUniformLocation(programManager.active, "uViewMatrix");
    mat4.lookAt(vMatrix, [35, 35, 35], [0, 0, 0], [0, 0, 1]);
    gl.uniformMatrix4fv(u_view_matrix, false, vMatrix);
    
    var u_model_matrix = gl.getUniformLocation(programManager.active, "uModelMatrix");
    mat4.identity(mMatrix);
    //mat4.translate(mMatrix, mMatrix, [-15.0, -15.0, 0.0]);
    //mat4.rotate(mMatrix, mMatrix, Math.sin(tick), [0.0, 0.0, 1.0]);
    gl.uniformMatrix4fv(u_model_matrix, false, mMatrix);
    
    my_grid.drawVertexGrid();
    
}

function main() {
    

    // Setup webGL and canvas
    setupWebGL();
    
    // Load shaders and programs
    programManager = new ProgramManager();
    
    programManager.addShader("default-vs");
    programManager.addShader("default-fs");
    
    programManager.addProgram("default", ["default-vs", "default-fs"]);
    programManager.useProgram("default");
    
    my_grid = new VertexGrid(20, 10);
    my_grid.createUniformPlaneGrid();
    my_grid.createIndexBuffer();
    my_grid.setupWebGLBuffers();
    
    drawScene();
    //setInterval(drawScene, 16);  

}

