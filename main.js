var gl = null,
	canvas = null,
	glProgram = null,
	fragmentShader = null,
	vertexShader = null,
	t = 0.0;
	my_grid = null;

var mvMatrix = mat4.create();
var pMatrix = mat4.create();

function getShader(gl, id) {
	var shaderScript, src, currentChild, shader;

	// Obtenemos el elemento <script> que contiene el código fuente del shader.
	shaderScript = document.getElementById(id);
	if (!shaderScript) return null;

	// Extraemos el contenido de texto del <script>.
	src = "";
	currentChild = shaderScript.firstChild;
	while(currentChild) {
		if (currentChild.nodeType == currentChild.TEXT_NODE) {
			src += currentChild.textContent;
		}
		currentChild = currentChild.nextSibling;
	}

	// Creamos un shader WebGL según el atributo type del <script>.
	if(shaderScript.type == "x-shader/x-fragment") {
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	}else if(shaderScript.type == "x-shader/x-vertex") {
		shader = gl.createShader(gl.VERTEX_SHADER);
	}else{
		return null;
	}

	// Le decimos a WebGL que vamos a usar el texto como fuente para el shader.
	gl.shaderSource(shader, src);

	// Compilamos el shader.
	gl.compileShader(shader);  
	  
	// Chequeamos y reportamos si hubo algún error.
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {  
	  alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
	  return null;  
	}
	  
	return shader;
}

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
			if (y > 0) {
				// Degenerate begin: repeat first vertex
				this.index_buffer[offset++] = y * this.cols;
			}

			for (x = 0; x < this.cols; x++) {
				// One part of the strip
				this.index_buffer[offset++] = (y * this.cols) + x;
				this.index_buffer[offset++] = ((y+1) * this.cols) + x;
			}

			if (y < this.rows-2) {
				// Degenerate end: repeat last vertex
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
			   this.position_buffer.push(i);
			   this.position_buffer.push(j);
			   this.position_buffer.push(0.0);

			   // Para cada vértice definimos su color
			   this.color_buffer.push(i/this.cols);
			   this.color_buffer.push(j/this.rows);
			   this.color_buffer.push(0.75);
									  
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

		var vertexPositionAttribute = gl.getAttribLocation(glProgram, "aVertexPosition");
		gl.enableVertexAttribArray(vertexPositionAttribute);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_position_buffer);
		gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

		var vertexColorAttribute = gl.getAttribLocation(glProgram, "aVertexColor");
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


function initWebGL()
{
	canvas = document.getElementById("my-canvas");  
	try{
		gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");                    
	}catch(e){
	}
					
	if(gl)
	{
		setupWebGL();
		initShaders();
		setupBuffers();
		setInterval(drawScene, 10);  
	}else{    
		alert(  "Error: Your browser does not appear to support WebGL.");
	}
}

function setupWebGL() {
	//set the clear color
	gl.clearColor(0.1, 0.1, 0.2, 1.0);     
	gl.enable(gl.DEPTH_TEST);                              
	gl.depthFunc(gl.LEQUAL); 
	gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
	gl.viewport(0, 0, canvas.width, canvas.height);
	
	this.utick = 0.0;
}

function initShaders() {
	// Obtenemos los shaders ya compilados
	var fragmentShader = getShader(gl, "basic-fs");
	var vertexShader = getShader(gl, "basic-vs");

	// Creamos un programa de shaders de WebGL.
	glProgram = gl.createProgram();

	// Asociamos cada shader compilado al programa.
	gl.attachShader(glProgram, vertexShader);
	gl.attachShader(glProgram, fragmentShader);

	// Linkeamos los shaders para generar el programa ejecutable.
	gl.linkProgram(glProgram);

	// Chequeamos y reportamos si hubo algún error.
	if(!gl.getProgramParameter(glProgram, gl.LINK_STATUS)) {
	  alert("Unable to initialize the shader program: " + gl.getProgramInfoLog(glProgram));
	  return null;
	}

	// Le decimos a WebGL que de aquí en adelante use el programa generado.
	gl.useProgram(glProgram);
}

function makeShader(src, type) {
	//compile the vertex shader
	var shader = gl.createShader(type);
	gl.shaderSource(shader, src);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert("Error compiling shader: " + gl.getShaderInfoLog(shader));
	}
	return shader;
}

function setupBuffers() {
	my_grid = new VertexGrid(16, 16);
	my_grid.createUniformPlaneGrid();
	my_grid.createIndexBuffer();
	my_grid.setupWebGLBuffers();
}

function drawScene() {
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	var u_proj_matrix = gl.getUniformLocation(glProgram, "uPMatrix");
	// Preparamos una matriz de perspectiva.
	mat4.perspective(pMatrix, 45, 640.0/480.0, 0.1, 100.0);
	gl.uniformMatrix4fv(u_proj_matrix, false, pMatrix);

	var u_model_view_matrix = gl.getUniformLocation(glProgram, "uMVMatrix");
	// Preparamos una matriz de modelo+vista.
	mat4.lookAt(mvMatrix, [25, 25, 25], [0, 0, 0], [0, 0, 1]);
	//mat4.translate(mvMatrix, mvMatrix, [0.0, 0.0, 0.0]);
	//mat4.rotate(mvMatrix, mvMatrix, 45.0, [0.0, 0.0, 1.0]);

	gl.uniformMatrix4fv(u_model_view_matrix, false, mvMatrix);

	this.utick += 0.05;
	var u_tick = gl.getUniformLocation(glProgram, "uTick");
	gl.uniform1f(u_tick, this.utick);
	
	my_grid.drawVertexGrid();
}