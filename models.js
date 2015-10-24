function createCylinder(name, color) {
	var cylinder = new Cylinder();
	cylinder.create(name, "lighting");
	cylinder.setupModelData(20, 10, color);
	cylinder.setupIndexBuffer();
	cylinder.setupGLBuffers();
	return cylinder;
}

//rueda de la vuelta al mundo
function createWheel(name, parent) {
	var color = [ 0, 0, 0.1 ];
	var cylinder;
	var i;
	for (i=0; i<15 ; i++) {
		//rueda exterior
		cylinder = createCylinder(name+"Arco"+i, color);
		parent.attachChild(cylinder);
		cylinder.rotate(i*24, [0.0, 1.0, 0.0]);
		cylinder.translate([2.0, 0.0, -0.425]);
		cylinder.scale([0.1, 0.1, 0.850]);

		//rueda interior
		cylinder = createCylinder(name+"ArcoInt"+i, color);
		parent.attachChild(cylinder);
		cylinder.rotate(i*24, [0.0, 1.0, 0.0]);
		cylinder.translate([1.0, 0.0, -0.217]);
		cylinder.scale([0.1, 0.1, 0.425]);

		//radios
		cylinder = createCylinder(name+"Radio"+i, color);
		parent.attachChild(cylinder);
		cylinder.rotate(6+(i*24), [0.0, 1.0, 0.0]);

		cylinder.scale([0.1, 0.1, 2]);
	}
	return parent;
}

