var blue = [ 0, 0, 1 ];
var red = [ 1, 0, 0 ];
var darkgreen = [ 0.5, 0.5, 0 ];
var green = [ 0, 1, 0.5 ];
var grey = [ 0.15, 0.15, 0.15 ];
var yellow = [ 1, 1, 0 ];
var orange = [ 1, 0.6, 0 ];
var pink = [ 1, 0.3, 0.7 ];

function createCylinder(name, color) {
	var cylinder = new Cylinder();
	cylinder.create(name, "lighting");
	cylinder.setupModelData(20, 10, color);
	cylinder.setupIndexBuffer();
	cylinder.setupGLBuffers();
	return cylinder;
}

function createPlane(name, color) {
	var grid = new Grid();
	grid.create(name, "lighting");
	grid.setupModelData(2, 2, color);
	grid.setupIndexBuffer();
	grid.setupGLBuffers();
	return grid;
}

function createFigure(name, positions, color) {
	var shape = new Poligon();
    shape.create("name", "lighting");
	shape.setupModelData(positions, color);
	shape.setupIndexBuffer();
	shape.setupGLBuffers();
	return shape;
}

function createCircle(name, color) {
	var circle = new Circle();
	circle.create(name, "lighting");
	circle.setupModelData(50, color);
	circle.setupIndexBuffer();
	circle.setupGLBuffers();
	return circle;
}

function createRevoSurface(name, color, func, deriv) {
	var surface = new SurfaceOfRevolution();
	surface.create(name, "lighting");
	surface.setupModelData(25, 25, color, func, deriv);
	surface.setupIndexBuffer();
	surface.setupGLBuffers();
	return surface;
}

function RollerCoaster() {
	this.rollercoaster = null;
	this.car = null;
	this.carcolor = blue;
	this.railscolor = red;
	this.spline = new Bspline(4);
    this.spline.controlPoints = [
		[5, 0, 1],
		[6, 5, 1],
		[5, 7, 5],
		[-5, 7, 3],
		[-3,0, 1],
		[-2,-2,2],
		[4,-5,1],
    ];
	
    // Curva cerrada
    this.spline.controlPoints = this.spline.controlPoints.concat(
        this.spline.controlPoints.slice(0, this.spline.order - 1)
    );

	this.createModel = function(parent) {
		//estructura
		structure = new SceneNode();
		structure.create("estruc", null);
		createRollerCoaster(structure, this.spline, this.railscolor);
		parent.attachChild(structure);
		
		//carrito
		this.car = new SceneNode();
		this.car.create("car", null);
		createCar("car", this.car, this.carcolor);
		parent.attachChild(this.car);	
	
	/*	var pos = this.spline.pos(0);
		var tang = this.spline.tan(0);
		var forward = [0,1,0];

		var rot = 180 * Math.acos(1/vec3.length(tang)) / Math.PI;
		var rotaxe = [];
		vec3.cross(rotaxe, forward, tang);
		this.car.translate(pos);
		this.car.rotate(rot, rotaxe);
		this.car.scale([3,3,3]);*/
	}
	
	
	this.animate = function(tick) {
		var s = tick/100 % 1;
		this.car.reset();
		
		var pos = this.spline.pos(s);
		this.car.translate(pos);
 
        // Calculate orientation
        var forward = vec3.fromValues(0,1,0);
		var tg = this.spline.tan(s);

		
        vec3.normalize(tg, tg);
        var up = [0, 0, 1];
        var left = [];
        vec3.cross(left, up, tg);
        vec3.normalize(left, left);
        vec3.cross(up, tg, left);
 
        mat4.multiply(this.car.mMatrix, this.car.mMatrix, [].concat(
          left, [0],
          up, [0],
          tg, [0],
          [0, 0, 0, 1]
        ));
 
		this.car.rotate(90, [1, 0, 0]);
		this.car.scale([3,1,-3]);
		
		// Update camera
		camera.updateCartParams(pos, tg);
	}
}


//sillas voladoras
function FlyingChairs() {
	this.disco = null;
	this.color = red;

	this.createModel = function(parent) {
		//columna
		columna = new SceneNode();
		columna.create("sup", null);
		createMainColumn("hola", columna, this.color);
		parent.attachChild(columna);
		columna.scale([1.2,1.2,1]);
		
		//disco
		this.disco = new SceneNode();
		this.disco.create("sup", null);
		createDisk("hola", this.disco, this.color);
		parent.attachChild(this.disco);
		this.disco.translate([0,0,0.9]);
		this.disco.rotate(15,[0,1,0])
		this.disco.scale([0.5,0.5,0.5]);
	}
	
	this.animate = function (tick) {
		this.disco.reset();
		this.disco.translate([0,0,0.9]);
		this.disco.rotate(15,[0,1,0])
		this.disco.rotate(tick, [0,0,1]);
		this.disco.scale([0.5,0.5,0.5]);
		
		
	}

}

//la vuelta l mundo
function FerrisWheel() {
	this.wheelSet = null;
	this.boxSet = null;
	this.boxes = [];
	this.pilarSet = null;
	this.color = grey;

    this.createModel = function(parent) {
		//creacion de los soprtes
		this.pilarSet = new SceneNode();
		this.pilarSet.create("wheelSet", null);
		createPilarSet("setpilar", this.pilarSet, this.color);
		parent.attachChild(this.pilarSet);
	
		//creacion de las ruedas
		this.wheelSet = new SceneNode();
		this.wheelSet.create("wheelSet", null);
		createWheelSet("ruedaquegira", this.wheelSet, this.color);
		parent.attachChild(this.wheelSet);
		
		var i;
		var box = null;
		var boxcolors = [ blue, green, orange, pink, yellow, red,  darkgreen ];

		//creacion de carritos
		this.boxSet = new SceneNode();
		this.boxSet.create("boxSet", null);
		for (i = 0;i < 7;i++) {
			box = new SceneNode();
			box.create("box", null);
			createBox(name+"Box"+i, box, boxcolors[i]);
			this.boxSet.attachChild(box);			
			box.translate([0, 0, -0.60]);
			box.rotate(12+i*360/7, [0.0, 1.0, 0.0]);
			box.translate([2, 0, 0]);
			box.rotate(-(12+i*360/7), [0.0, 1.0, 0.0]);
			box.rotate(90, [1.0, 0.0, 0.0]);
			box.scale([0.4, 0.4, 0.4]); 
			this.boxes.push(box);
		}
		this.wheelSet.attachChild(this.boxSet);
		
		//corro la rueda a la altura de los soportes
		this.wheelSet.translate([0, 0, 3]);
	}
	
	this.animate = function(tick) {
		this.wheelSet.reset();
		this.wheelSet.translate([0, 0, 3]);
		this.wheelSet.rotate(tick, [0, 1, 0]);	
		
		var i;
		for (i=0; i<7; i++) {
			this.boxes[i].reset();
			//reescribo las transf
			this.boxes[i].rotate(-tick, [0, 1, 0]);
			this.boxes[i].translate([0, 0, -0.60]);
			this.boxes[i].rotate(12+i*360/7+tick, [0.0, 1.0, 0.0]);
			this.boxes[i].translate([2, 0, 0]);
			this.boxes[i].rotate(-(12+i*360/7+tick), [0.0, 1.0, 0.0]);
			this.boxes[i].rotate(90, [1.0, 0.0, 0.0]);
			this.boxes[i].scale([0.4, 0.4, 0.4]); 
		}
	}
}

//rueda de la vuelta al mundo
function createWheel(name, parent, color) {
	var cylinder;
	var i;
	for (i=0; i<14 ; i++) {
		//rueda exterior
		cylinder = createCylinder(name+"Arc"+i, color);
		parent.attachChild(cylinder);
		cylinder.rotate(i*360/14, [0.0, 1.0, 0.0]);
		cylinder.translate([2.0, 0.0, -0.456]);
		cylinder.scale([0.1, 0.1, 0.9129]);

		//rueda interior
		cylinder = createCylinder(name+"ArcInt"+i, color);
		parent.attachChild(cylinder);
		cylinder.rotate(i*360/14, [0.0, 1.0, 0.0]);
		cylinder.translate([1.0, 0.0, -0.228]);
		cylinder.scale([0.1, 0.1, 0.456]);

		//radios
		cylinder = createCylinder(name+"Radius"+i, color);
		parent.attachChild(cylinder);
		cylinder.rotate((i*360/14), [0.0, 1.0, 0.0]);

		cylinder.scale([0.1, 0.1, 2]);
	}
	return parent;
}

//par de ruedas de la vuelta al mundo unidas con cilindros
function createWheelSet(name, parent, color) {
	//cilindo central
	var centralCylinder = createCylinder(name+"CentralCylinder", color);
	parent.attachChild(centralCylinder);
	centralCylinder.rotate(90, [1.0, 0.0, 0.0]);
	centralCylinder.translate([0.0, 0.0, -0.7]);
	centralCylinder.scale([0.3, 0.3, 1.4]);
	
	//tapas del cilindro central
	var circulo = createCircle("circulo", color  );	
	parent.attachChild(circulo);
	circulo.translate([0.0, 0.7, 0]);
	circulo.rotate(90, [1.0, 0.0, 0.0]);
	circulo.scale([0.3, 0.3, 0]);
	circulo.scale([1, 1, -1]); 
	
	circulo = createCircle("circulo", color  );	
	parent.attachChild(circulo);
	circulo.translate([0.0, -0.7, 0]);
	circulo.rotate(90, [1.0, 0.0, 0.0]);
	circulo.scale([0.3, 0.3, 0]);

	//rueda frontal
	var wheel = new SceneNode();
    wheel.create("wheel", null);
   	createWheel("rueda", wheel, color);
	wheel.translate([0.0, 0.4, 0.0]);
	parent.attachChild(wheel);

	//rueda de atras
	wheel = new SceneNode();
	wheel.create("wheel2", null);
   	createWheel("rueda2", wheel, color);
	wheel.translate([0.0, -0.4, 0.0]);
	parent.attachChild(wheel);

	//uniones
	var joint;
	var i;
	for (i=0; i<14 ; i++) {
		joint = createCylinder(name+"Joint"+i, color);
		parent.attachChild(joint);
		joint.rotate(i*360/14, [0.0, 1.0, 0.0]);
		joint.translate([2.0, 0.4, -0.4]);
		joint.rotate(90, [1.0, 0.0, 0.0]);
		joint.scale([0.1, 0.1, 0.8]);
	}

	return parent;	
}
	
//VAGON DE VUELTA AL MUNDO
function createBox(name, parent, color) {
	//front face
	var face = new SceneNode();
	face.create("frontface", null);
	createBoxFace("frontalface", face, color);
	parent.attachChild(face);
	face.translate([-0.5, -0.5, 0.5]);

	//back face
	face = new SceneNode();
	face.create("backface", null);
	createBoxFace("backcara", face, color);
	parent.attachChild(face);
	face.translate([-0.5, -0.5, -0.5]);
	face.scale([1, 1, -1]); 

	//side face
	face = new SceneNode();
	face.create("sidef", null);
	createBoxFace("sideface", face, color);
	parent.attachChild(face);
	face.rotate(90, [0.0, 1.0, 0.0]);
	face.translate([-0.5, -0.5, -0.5]);
	face.scale([1, 1, -1]); 

	//other side face
	face = new SceneNode();
	face.create("sideleft", null);
	createBoxFace("sifeleface", face, color);
	parent.attachChild(face);
	face.rotate(-90, [0.0, 1.0, 0.0]);
	face.translate([-0.5, -0.5, -0.5]);
	face.scale([1, 1, -1]); 

	//roof
	var grid = createPlane(name, color);
	parent.attachChild(grid);
	grid.translate([-0.5, 1.5, -0.5]);
	grid.rotate(90, [1.0, 0.0, 0.0]);
	grid.scale([1, 1, -1]); 


	//floor
	grid = createPlane(name, color);
	parent.attachChild(grid);
	grid.translate([-0.5, -0.5, -0.5]);
	grid.rotate(90, [1.0, 0.0, 0.0]);

	return parent;
       	
}

//cara del vagon 
function createBoxFace(name, parent, color) {
	//main grid
	var grid = createPlane(name, color);
	parent.attachChild(grid);

	//left grid
	grid = createPlane(name, color);
	parent.attachChild(grid);
	grid.translate([0.0, 1, 0.0]);
	grid.scale([0.2, 1, 1]); 

	//right grid
	grid = createPlane(name, color);
	parent.attachChild(grid);
	grid.translate([0.8, 1, 0.0]);
	grid.scale([0.2, 1, 1]); 

	//top grid
	grid = createPlane(name, color);
	parent.attachChild(grid);
	grid.translate([0, 1.8, 0.0]);
	grid.scale([1, 0.2, 1]); 
	
	return parent;
}

//par de pilares de la vuelta al mundo
function createPilarSet(name, parent, color) {
	//rueda frontal
	var pilar = new SceneNode();
    pilar.create("pilar", null);
   	createPilar("pilar", pilar, color);
	pilar.translate([0.0, 0.6, 0.0]);
	parent.attachChild(pilar);

	//rueda de atras
	pilar = new SceneNode();
    pilar.create("pilar", null);
   	createPilar("pilar", pilar, color);
	pilar.translate([0.0, -0.6, 0.0]);
	parent.attachChild(pilar);
	
	return parent;
}

//pilar de la vuelta al mundo
function createPilar(name, parent, color) {
	//cara frontal
	var positions = [ [-0.8, 0], [0.8, 0], [0.2, 3.2], [-0.2, 3.2] ] ;
	var shape;

	shape = createFigure("frontfacepilar", positions, color);
	parent.attachChild(shape);
	shape.translate([0, 0.05, 0.0]);
	shape.rotate(90, [1.0, 0.0, 0.0]);
	shape.scale([1, 1, -1]); 
	
	//cara trasera
	shape = createFigure("backfacepilar", positions, color);
	parent.attachChild(shape);
	shape.translate([0, -0.05, 0.0]);
	shape.rotate(90, [1.0, 0.0, 0.0]);
	
	//tapa lateral
	var grid = createPlane("leftface", color);
	parent.attachChild(grid);
	grid.translate([0.8, 0, 0.0]);
	grid.rotate(-10.65, [0.0, 1.0, 0.0]);
	grid.rotate(90, [0.0, 0.0, 1.0]);
	grid.rotate(90, [1.0, 0.0, 0.0]);
	grid.translate([-0.05, 0, 0.0]);
	grid.scale([0.1, 3.255, 1]); 
	
	//otra tapa lateral
	grid = createPlane("rigthface", color);
	parent.attachChild(grid);
	grid.translate([-0.8, 0, 0.0]);
	grid.rotate(10.65, [0.0, 1.0, 0.0]);
	grid.rotate(90, [0.0, 0.0, 1.0]);
	grid.rotate(90, [1.0, 0.0, 0.0]);
	grid.translate([-0.05, 0, 0.0]);
	grid.scale([0.1, 3.255, 1]); 
	grid.scale([1, 1, -1]); 
	
	//tapa superior
	grid = createPlane("topface", color);
	parent.attachChild(grid);
	grid.translate([-0.2, -0.05, 3.2]);
	grid.scale([0.4, 0.1, 1]); 

	return parent;
}


// Array clone
function arrayClone(arr) {
    var i, copy;
    if(Array.isArray(arr)) {
        copy = arr.slice(0);
        for(i = 0;i < copy.length;i++) {
            copy[i] = arrayClone(copy[i]);
        }
        return copy;
    }else if(typeof arr === 'object') {
        throw 'Cannot clone array containing an object!';
    }else{
        return arr;
    }
}

function createRollerCoaster(parent, spline, color) {
    
    cutVerts = [[.08, .08], [-.08, .08], [-.08, -.08], [.08, -.08]];
    cutNormals = [[.7, .7], [-.7, .7], [-.7, -.7], [.7, -.7]];
    cutVertsLeft = arrayClone(cutVerts);
    cutVertsLeft.forEach(function(v) { v[0] -= .4; });
    cutVertsRight = arrayClone(cutVerts);
    cutVertsRight.forEach(function(v) { v[0] += .4; });
    
	//rieles
    leftRail = new ExtrusionSurface();
    leftRail.create("leftRail", "lighting");
    leftRail.setupModelData(
        cutVertsLeft,
        cutNormals,
        color,
        spline,
        50);
    leftRail.setupIndexBuffer();
    leftRail.setupGLBuffers();

    rightRail = new ExtrusionSurface();
    rightRail.create("rightRail", "lighting");
    rightRail.setupModelData(
        cutVertsRight,
        cutNormals,
        color,
        spline,
        50);
    rightRail.setupIndexBuffer();
    rightRail.setupGLBuffers();
	
	
	cutVerts = [[0.07, 0.07], [-0.07, 0.07], [-0.07, -0.07], [0.07, -0.07]];
	centralRail = new ExtrusionSurface();
    centralRail.create("centralrail", "lighting");
    centralRail.setupModelData(
        cutVerts,
        cutNormals,
        color,
        spline,
        50);
    centralRail.setupIndexBuffer();
    centralRail.setupGLBuffers();    
	
	parent.attachChild(centralRail);
    parent.attachChild(leftRail);
    parent.attachChild(rightRail);
	
	//durmientes	
	var u = 0;
	var pos = spline.pos(u);
	var tang;
	var rot;
	var curveLength = 0;
	for (u; u<1; u=u+0.001) {
		newpos = spline.pos(u);
		curveLength +=  vec3.distance(newpos, pos);
		pos = newpos;
	}
	
	var sleepersNum = 70;
	var colsNum = 10;
	var sleepersGap = curveLength / sleepersNum;
	var colsGap = curveLength / colsNum; 

	var sleepD = 0;
	var colsD = 0;
	var u = 0;
	pos = spline.pos(u);
	var newpos;
	for (u; u<1; u=u+0.001) {
			newpos = spline.pos(u);
			sleepD +=  vec3.distance(newpos, pos);
			colsD +=  vec3.distance(newpos, pos);
			if (sleepD>=sleepersGap) {
				tang = spline.tan(u);
				rot = 180 * Math.atan2(tang[1],tang[0]) / Math.PI;

				cylinder = createCylinder("sleeper", color);
				cylinder.translate(pos);
				cylinder.rotate(rot+90, [0.0, 0.0, 1.0]);
				cylinder.rotate(90, [0.0, 1.0, 0.0]);
				cylinder.translate([0, 0, -0.425]);
				cylinder.scale([0.15, 0.15, .85]);
							
				parent.attachChild(cylinder);
				sleepD = 0;
			}
			if (colsD>= colsGap) {
				var height = pos[2];
				cylinder = createCylinder("sleeper", color);
				cylinder.translate([pos[0], pos[1], 0]);
				cylinder.scale([0.15, 0.15, height]);
				parent.attachChild(cylinder);
				colsD = 0;
			}
			pos = newpos;
	} 
	

}

function createCar(name, parent, color) {
	//panel lateral
	var positions = [ [0, 0], [-0.25, 0], [-0.25, 0.45], [-0.2, 0.7], [0.0, 0.7] ] ;
	var shape;
	shape = createFigure("rightpanel", positions, color);
	parent.attachChild(shape);
	shape.translate([0.15, 0.0, 0.0]);
	shape.rotate(90, [0.0, 1.0, 0.0]);
	
	//otro panel lateral
	shape = createFigure("leftpanel", positions, color);
	parent.attachChild(shape);
	shape.translate([-0.15, 0.0, 0.0]);
	shape.rotate(90, [0.0, 1.0, 0.0]);
	shape.scale([1, 1, -1]);
	
	//piso
	var grid = createPlane("pisocar", color);
	parent.attachChild(grid);
	grid.translate([-0.15, 0.0, 0.0]);
	grid.scale([0.3, 0.7, -1]);
	
	//panel trasero
	grid = createPlane("backpanelcar", color);
	parent.attachChild(grid);
	grid.rotate(90, [1.0, 0.0, 0.0]);
	grid.translate([-0.15, 0.0, 0.0]);
	grid.scale([0.3, 0.25, 1]);
	
	//panel frontal
	grid = createPlane("frontpanelcar", color);
	parent.attachChild(grid);
	grid.translate([0.0, 0.7, 0.0]);
	grid.rotate(90, [1.0, 0.0, 0.0]);
	grid.translate([-0.15, 0.0, 0.0]);
	grid.scale([0.3, 0.2, -1]);
	
	//panel capot 11.53
	grid = createPlane("frontpanelcar", color);
	parent.attachChild(grid);
	grid.translate([0.0, 0.45, 0.25]);
	grid.rotate(-11.53, [1.0, 0.0, 0.0]);
	grid.translate([-0.15, 0.0, 0.0]);
	grid.scale([0.3, 0.252, 1]);
	
	//sillas
	var silla = new SceneNode();
	silla.create("sillacar", null);
	createCarChair("silla atras", silla, yellow);
	parent.attachChild(silla);
	silla.translate([0.0, 0.05, 0.15]);
	silla.scale([0.3, 0.15, 0.15]);
	
	silla = new SceneNode();
	silla.create("otrasilla", null);
	createCarChair("silla atras", silla, yellow);
	parent.attachChild(silla);
	silla.translate([0.0, 0.3, 0.15]);
	silla.scale([0.3, 0.15, 0.15]);
	
}

//columna de flying chairs
function createMainColumn(name, parent, color) {
	var contorno = function(s) {
		if (s<=0.3) {
			return 1;
		} else if (s>0.3 && s<= 0.45) {
			return -(s-0.3)+1; 
		} else if (s>0.45 && s<= 0.6)  {
			return 0.85;
		} else if (s>0.6 && s<= 0.65)  {
			return -(s-0.45)+1;
		} else if (s> 0.65 && s<= 1)  {
			return 0.8;
		}
	}
	
	var derivada = function(s) {
		if (s<=0.3) {
			return 0;
		} else if (s>0.3 && s<= 0.45) {
			return -1; 
		} else if (s>0.45 && s<= 0.6)  {
			return 0;
		} else if (s>0.6 && s<= 0.65)  {
			return -1;
		} else if (s> 0.65 && s<= 1)  {
			return 0;
		}
	}

	var sup = createRevoSurface("hola", color, contorno, derivada);
	parent.attachChild(sup);
	sup.scale([0.3,0.3,1]);
}
	
//disco de flying chairs
function createDisk(name, parent, color) {
	var contorno = function(s) {
		if (s<=0.5) {
			return s;
		} else if (s>0.5 && s<= 1) {
			return 0.5; 
		}
	}
	
	var derivada = function(s) {
		if (s<=0.5) {
			return 1;
		} else if (s>0.5 && s<= 1) {
			return 0; 
		}
	}
	
	var sup = createRevoSurface("hola", color, contorno, derivada);
	parent.attachChild(sup);
	
	var tapa = createCircle("tapa", color);
	tapa.translate([0,0,1]);
	tapa.scale([0.5,0.5,0.5]);
	sup.attachChild(tapa);
	sup.scale([6,6,0.9]);

	
	//creo las sillas alrededor
	var i = 0;
	var chairstring;
	var chaircolors = [ blue, green, orange, pink, yellow, red,  darkgreen ]
	for (i; i<14;i++) {
		chairstring = new SceneNode();
		chairstring.create("wheel", null);
		createStringChair(name+"chair"+i, chairstring, chaircolors[i%7]);
		parent.attachChild(chairstring);
		chairstring.rotate(i*360/14, [0.0, 0.0, 1.0]);
		chairstring.translate([1.5, 0.0, 0.5]);
		chairstring.rotate(-20, [0.0, 1.0, 0.0]);
		chairstring.scale([0.2, 0.2, 0.2]);
	}
	
}
	
function createFlyingChairs(name, parent, color) {
	//columna
	columna = new SceneNode();
	columna.create("sup", null);
	createMainColumn("hola", columna, color);
	parent.attachChild(columna);
	columna.scale([1.2,1.2,1]);
	
	//disco
	disco = new SceneNode();
	disco.create("sup", null);
	createDisk("hola", disco, color);
	parent.attachChild(disco);
	disco.translate([0,0,0.9]);
	disco.rotate(15,[0,1,0])
	disco.scale([0.5,0.5,0.5]);
}

function createStringChair(name, parent, color) {
	//silla
	var chair = new SceneNode();
	chair.create("sup", null);
	createCarChair("hola", chair, color);
	parent.attachChild(chair);
	chair.translate([0,1/3,-7]);
	
	//cuerda
	var cyl = createCylinder("cuerda", grey);
	parent.attachChild(cyl);
	cyl.translate([0,0,-6]);
	cyl.scale([0.05,0.05,6]);
	
}


//silla
function createCarChair(name, parent, color) {
	//asiento
	var grid = createPlane("asiento", color);
	parent.attachChild(grid);
	grid.translate([-0.5, 0.0, 0.0]);
	
	//respaldo
	grid = createPlane("respaldo", color);
	parent.attachChild(grid);
	grid.rotate(109.47, [1.0, 0.0, 0.0]);
	grid.translate([-0.5, 0.0, 0.0]);
	grid.scale([1, 1, -1]);
	
	return parent;
}

