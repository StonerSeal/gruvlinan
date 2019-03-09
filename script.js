console.clear();

let g = 9.82;
let pi = Math.PI;

function delta(_F, _L, _E, _A) {
    return (_F * _L) / (_E * _A);
}

function circleArea(_D) {
    return (pi * Math.pow(_D, 2)) / 4;
}

function avg(array = []) {
    return array.reduce((acc, v) => acc + v, 0) / array.length;
}


class Tråd {
    constructor(_D, _L, _E_GPa_RANGE, _Density_RANGE, _sträckgräns_RANGE, _brottgräns_RANGE) {
        this.D = _D;
        this.L = _L;
        this.E_GPa = avg(_E_GPa_RANGE);
        this.E = this.E_GPa * 1000;
        this.Density = avg(_Density_RANGE);
        this.sträckgräns = avg(_sträckgräns_RANGE);
        this.brottgräns = avg(_brottgräns_RANGE);
    }
    get A() {
        return circleArea(this.D);
    }
    get V() {
        return this.A * this.L;
    }
    get egenvikt() {
        let V_dm3 = this.V / Math.pow(100, 3);
        return this.Density * V_dm3;
    }

    extraViktFörGräns(_gräns) {
        let F = _gräns * this.A;
        let m = F / g;
        return Math.floor(m - this.egenvikt);
    }

    get extraViktFörSträckgräns() {
        return this.extraViktFörGräns(this.sträckgräns);
    }

    get extraViktFörBrottgräns() {
        return this.extraViktFörGräns(this.brottgräns);
    }
}

class Vajer {
    /**
     * @param {Tråd} _tråd 
     * @param {Number} _viktAttBära 
     */
    constructor(_tråd, _viktAttBära) {
        this.tråd = _tråd;
        this.viktAttBära = _viktAttBära;
    }
    get antalTrådar() {
        return Math.ceil(this.viktAttBära / this.tråd.extraViktFörSträckgräns);
    }
    get egenvikt() {
        return this.tråd.egenvikt * this.antalTrådar;
    }
    get A() {
        return this.tråd.A * this.antalTrådar;
    }
    get D() {
        return Math.sqrt((this.A * 4) / pi);
    }
    get förlängning() {
        let m = this.viktAttBära + this.egenvikt;
        let F = m * g;
        return delta(F, this.tråd.L, this.tråd.E, this.A);
    }
    get längdEfterFörlängning() {
        return this.förlängning + this.tråd.L;
    }

    extraViktFörGräns(_gräns) {
        let F = _gräns * this.A;
        let m = F / g;
        return Math.floor(m - this.egenvikt);
    }

    get extraViktFörSträckgräns() {
        return this.extraViktFörGräns(this.tråd.sträckgräns);
    }

    get extraViktFörBrottgräns() {
        return this.extraViktFörGräns(this.tråd.brottgräns);
    }
}

class Trumma {
    /**
     * @param {Vajer} _vajer 
     * @param {Number} _D 
     */
    constructor(_vajer, _D) {
        this.vajer = _vajer;
        this.D = _D;
    }
    get L() {
        let upprulladVajer_D = this.D + this.vajer.D;
        let upprulladVajer_O = upprulladVajer_D * pi;
        let antalVarv = vajer.längdEfterFörlängning / upprulladVajer_O;
        return antalVarv * this.vajer.D;
    }
}


let tråd = new Tråd(
    5,            //Diameter    (mm)
    1000000,      //Längd       (mm)
    [2.62, 3.2],  //E-modul     (range - GPa)
    [1.12, 1.14], //Densitet    (range - Mg/m3)
    [50, 94.8],   //Sträckgräns (range - MPa)
    [90, 165]     //Brottgräns  (range - MPa)
);
let vajer = new Vajer(
    tråd,
    2000 //Vikt att bära (kg)
);
let trumma = new Trumma(
    vajer,
    2000 //Diameter (mm)
);

console.log("Tråd specifikationer:");
console.log("Sträckgräns (kg): " + tråd.extraViktFörSträckgräns);
console.log("Brottgräns (kg):  " + tråd.extraViktFörBrottgräns);

console.log("");

console.log("Vajer specifikationer:");
console.log("Antal trådar: " + vajer.antalTrådar);
console.log(`Förlängning när man lyfter ${vajer.viktAttBära}kg (mm): ` + vajer.förlängning);
console.log("Sträckgräns (kg): " + vajer.extraViktFörSträckgräns);
console.log("Brottgräns (kg):  " + vajer.extraViktFörBrottgräns);

console.log("");

console.log("Trumma specifikationer:");
console.log("D (mm): " + trumma.D);
console.log("L (mm): " + trumma.L);
