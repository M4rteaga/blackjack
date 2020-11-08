var app = new Vue({
    el: '#app',
    data: {
        inicio: true,
        jugar: false,
        botonInicio: true,
        puesto: {
            Puesto: 0,
        },
        suma: 0,
        cartasSumadas: 0,
        totCartas: 2,
        datosJuego: {
            Estado: '',
            Segundos: 0,
            Cartas: {
                Valor:'',
                Tipo:'',
            },
            Turno: 0
        }
    },
    mounted() {
        this.autoUpdate();
    },
    methods: {
        async comenzarAJugar() {
            this.inicio = false;
            this.jugar = true;
            console.log("COMENZAR A JUGAR")
            // let response = await axios.get('/join')
            let response = await fetch('http://172.105.20.118:8080/join')
            this.datosJuego = await response.json()
            console.log("ESTADO: "+this.datosJuego.Estado)
            this.update()
        },
        async updatePuesto(){
            let response = await fetch('http://172.105.20.118:8080/puesto')
            this.puesto = await response.json()
            console.log("PUESTO UPDATED: "+this.puesto.Puesto)
        },
        async continuarJugando(){
            this.inicio = false;
            this.jugar = true;
        },
        async salirseDelJuego() {
            //let response = await fetch('http://172.105.20.118:8080/leave')
            // this.datosJuego = await response.json()
            this.inicio = true;
            this.jugar = false;
            // this.suma=0
            this.cartasSumadas=0
            this.totCartas=2
            
        },
        async hit() {
            console.log("ENTRO AL HIT")
            if (this.datosJuego.Turno==this.puesto.Puesto) {
                console.log("HIT------------->Hecho")
                // let response = await axios.get('/hit')
                let response = await fetch('http://172.105.20.118:8080/hit')
                this.totCartas++
                this.calcSuma()
                if(this.suma>21)
                    this.plantarse()
            }
        },
        autoUpdate: async function(){
            setInterval(() => {
                this.update()
            }, 1000);
        },
        async update() {
            // let response = await axios.get('/estado')
            // this.desplegarCartas()
            let response = await fetch('http://172.105.20.118:8080')
            if(this.datosJuego != await response.json()){
                this.datosJuego = await response.json()
                if(this.puest.Puesto==0){
                    this.updatePuesto()
                }
                this.actualizarCartas()
            }
            console.log("Segundos: "+this.datosJuego.Segundos)
            //this.calcSuma()
        },
        async plantarse() {
            if (this.datosJuego.Turno==this.puesto.Puesto){
                console.log("Stay--->Hecho")
                let response = await fetch('http://172.105.20.118:8080/stay')
            }
        },
        calcSuma(){
            if (this.puesto.Puesto>0 && this.datosJuego.Cartas!==null) {
                while (this.cartasSumadas<this.totCartas) {
                    let naipe=this.datosJuego.Cartas[this.puesto.Puesto][this.cartasSumadas]
                    valor=naipe.Tipo
                    if(valor=='J'||valor=='Q'||valor=='K'){
                        valor=10
                    }else if(valor=='A'){
                        if(this.suma>10){
                            valor=1
                        }else{
                            valor=11
                        }
                    }
                    console.log(valor+" "+this.cartasSumadas)
                    if (this.cartasSumadas<this.totCartas) {
                        this.suma=this.suma+parseInt(valor)
                        console.log("Suma: "+this.suma)
                        this.cartasSumadas++
                    }
                }
            }
        },
        async actualizarCartas(){
            let x="",y="",z="",w="",i,j,k,l
            

            // i=Math.ceil(Math.random()*10).  //esto era en modo de prueba
            // j=i+2
            // for(i;i<j;i++)//i in datosJuego.Cartas[0])
            //     x = x + '<img src="assets/svg/Corazon/'+i+'Corazon.svg" class="carta" />'

                //esta forma de sacar los valores de las cartas me la dijo posada, si no es así, peleen con él.
            for(i in datosJuego.Cartas[0]) //host
                x = x+ '<img src="assets/svg/'+i.Tipo+'/'+i.Valor+i.Tipo+'.svg" class="carta" />'
            for(j in datosJuego.Cartas[1]) //jugador1
                y = y+ '<img src="assets/svg/'+j.Tipo+'/'+j.Valor+j.Tipo+'.svg" class="carta" />'
            for(k in datosJuego.Cartas[2]) //jugador2
                z = z+ '<img src="assets/svg/'+k.Tipo+'/'+k.Valor+k.Tipo+'.svg" class="carta" />'
            for(l in datosJuego.Cartas[3]) //jugador3
                w = w+ '<img src="assets/svg/'+l.Tipo+'/'+l.Valor+k.Tipo+'.svg" class="carta" />'
            document.getElementById("host").innerHTML = x
            if(puesto.Puesto == 1){ //si el jugador 1 somos nosotros
                document.getElementById("jP").innerHTML = y
                document.getElementById("j1").innerHTML = z
                document.getElementById("j2").innerHTML = w
            }else if(puesto.Puesto == 2){ //si el jugador 2 somos nosotros
                document.getElementById("j1").innerHTML = y
                document.getElementById("jP").innerHTML = z
                document.getElementById("j2").innerHTML = w
            }else{ //si el jugador 2 somos nosotros
                document.getElementById("j1").innerHTML = y
                document.getElementById("j2").innerHTML = z
                document.getElementById("jP").innerHTML = w
            }
        },
    },
    computed: {
        verCartas(){
            if (this.datosJuego.Estado=='Disponible'||this.datosJuego.Estado=='Recibiendo') {
                this.datosJuego.Cartas = {'Valor':'','Tipo':''}
            }
            return this.datosJuego.Cartas[this.puesto.Puesto]
        },
    },
    asyncComputed: {

    }

});

