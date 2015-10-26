/**
 *  Creates a Bspline curve of any given order using the generic recursive 
 *  definition.
 *  @param {number} order Order of the Bspline curve (must be greater or equal
 *  than the number of control points).
 */
function Bspline(order) {
    this.controlPoints = [];
    this.order = order;


    /**
    *  Computes the value of the i-th bspline polynomial base of order k for a 
    *  given value of u.
    *  @param {number} i Index of the polynomial to use.
    *  @param {number} k Order of the polynomial (i.e.: degree + 1).
    *  @param {number} u Parameter value.
    */
    this.B = function(i,k,u) {
        if (k == 1) {
            if (i <= u && u < i+1)
                return 1;
            else
                return 0;
        } else {
            return (this.B(i,k-1,u)*(u-i) + this.B(i+1,k-1,u)*(i+k-u))/(k-1);
        }
    }


    /**
    *  Gets the position of a point in the curve for a given parameter u belonging
    *  to the interval [0,1).
    *  @param {number} u Parameter specifying which point in the curve to get.
    *  @return {vec3} Coordinates of the point in the curve.
    */
    this.pos = function(u) {
        u %= 1;
        var p = [0,0,0];
        var n = this.controlPoints.length;
        var k = this.order;
        var denormalizedU = u*((n)-(k-1)) + (k-1);
        for (var i = 0; i < n; i++) {
            var cp = this.controlPoints[i];
            var Bi = this.B(i, k, denormalizedU) 

            for (var j = 0; j < p.length; j++)
                p[j] += Bi * cp[j];
        }
        return p;
    }


    /**
    *  Gets the tangent to the curve on a position given by belonging
    *  to the interval [0,1).
    *  @param {number} u Parameter specifying which point in the curve to get.
    *  @return {vec3} Direction of the tangent to the curve.
    */
    this.tan = function(u) {
        u %= 1;
        var p = [0,0,0];
        var n = this.controlPoints.length;
        var k = this.order;
        var denormalizedU = u*((n-1)-(k-2)) + (k-2);
        for (var i = 0; i < n-1; i++) {
            var Bi = this.B(i, k-1, denormalizedU) 
          
            for (var j = 0; j < p.length; j++)
                p[j] += Bi * (this.controlPoints[i+1][j] - this.controlPoints[i][j]);
        }
        return p;
    }


    /**
    *  Returns an independent copy of the curve.
    *  @return {curve} The copy of the curve.
    */
    this.clone = function() {
        var newCurve = new Bspline(this.order);
        newCurve.controlPoints = [];
        for(var i = 0; i < this.controlPoints.length; i++)
            newCurve.controlPoints.push(this.controlPoints[i].slice(0));
        return newCurve;
    }
}

/**
 *  Creates a Bezier curve of any given order using the Bernstein polynomials'
 *  generic definition.
 *  @param {number} order Order of the Bezier curve (must be a divisor of the
 *  number of control points).
 */
function Bezier(order) {
    this.controlPoints = [];
    this.order = order;


    /**
    *  Computes the product of all the numbers from a to b (both included).
    *  @param {number} a First number of the product range.
    *  @param {number} b Last number of the product range.
    *  @return {number} Product of all the numbers from a to b (both included).
    */
    function productRange(a,b) {
        var product=a,i=a;

        while (i++ < b) {
            product*=i;
        }
        return product;
    }
   

    /**
    *  Computes the number of combinations of k elements taken from a group of 
    *  n elements.
    *  @param {number} n Number of elements available to combine.
    *  @param {number} k Number of elements of each combination.
    *  @return {number} Number of combinations.
    */
    function combinations(n,k) {
        k=Math.max(k,n-k);
        if (n==k) {
            return 1;
        } else {
            return productRange(k+1,n)/productRange(1,n-k);
        }
    }


    /**
    *  Computes the value of the i-th Bernstein polynomial of order k for a given
    *  value of u.
    *  @param {number} i Index of the polynomial to use.
    *  @param {number} k Order of the polynomial (i.e.: degree + 1).
    *  @param {number} u Parameter value.
    */
    this.B = function(i,k,u) {
        return Math.pow((1-u),k-1-i)*Math.pow(u,i)*combinations(k-1,i);
    }


    /**
    *  Gets the position of a point in the curve for a given parameter u belonging
    *  to the interval [0,1).
    *  @param {number} u Parameter specifying which point in the curve to get.
    *  @return {vec3} Coordinates of the point in the curve.
    */
    this.getPoint = function(u) {
        u %= 1;
        var p = [0,0,0];

        var l = this.controlPoints.length;
        var gz = this.order;
        var localU = ((u * l) % gz)/gz;
        var range = Math.floor(u * l / gz);
        for (var i = 0; i < gz; i++) {
        var cp = this.controlPoints[range*gz + i];
        var Bi = this.B(i, this.order, localU);
        for (var j = 0; j < p.length; j++)
            p[j] += Bi * cp[j];
        }
        return p;
    }


    /**
    *  Gets the tangent to the curve on a position given by belonging
    *  to the interval [0,1).
    *  @param {number} u Parameter specifying which point in the curve to get.
    *  @return {vec3} Direction of the tangent to the curve.
    */
    this.getTangent = function(u) {
        u %= 1;
        var p = [0,0,0];

        var l = this.controlPoints.length;
        var gz = this.order;
        var localU = ((u * l) % gz)/gz;
        var range = Math.floor(u * l / gz);
        for (var i = 0; i < gz - 1; i++) {
        var cp1 = this.controlPoints[range*gz + i];
        var cp2 = this.controlPoints[range*gz + i + 1];
        var Bi = this.B(i, this.order - 1, localU);
        for (var j = 0; j < p.length; j++)
            p[j] += Bi * this.order * (cp2[j] - cp1[j]);
        }
        return p;
    }


    /**
    *  Returns an independent copy of the curve.
    *  @return {curve} The copy of the curve.
    */
    this.clone = function() {
        var newCurve = new Bezier(this.order);
        newCurve.controlPoints = this.controlPoints.slice(0);
        return newCurve;
    }
}