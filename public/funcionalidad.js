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
            // this.cartasSumadas=0
            // this.totCartas=2
            
        },
        async hit() {
            console.log("ENTRO AL HIT")
            // if (this.datosJuego.Turno==this.puesto.Puesto) {
            //     console.log("HIT------------->Hecho")
            //     // let response = await axios.get('/hit')
            //     let response = await fetch('http://172.105.20.118:8080/hit')
            //     this.totCartas++
            // }
        },
        autoUpdate: async function(){
            setInterval(() => {
                this.update()
            }, 1000);
        },
        async update() {
            // let response = await axios.get('/estado')
            let response = await fetch('http://172.105.20.118:8080')
            this.datosJuego = await response.json()
            console.log("Segundos: "+this.datosJuego.Segundos)
            this.updatePuesto()
            //this.calcSuma()
        },
        calcSuma(){
            // if (this.puesto.Puesto>=0 && this.datosJuego.Cartas!==null) {
            //     while (this.cartasSumadas<this.totCartas) {
            //         let naipe=this.datosJuego.Cartas[this.puesto.Puesto][this.cartasSumadas]
            //         valor=naipe.Valor
            //         if(valor=='J'||valor=='Q'||valor=='K'){
            //             valor=10
            //         }else if(valor=='A'){
            //             valor=11
            //         }
            //         console.log(valor+" "+this.cartasSumadas)
            //         if (this.cartasSumadas<this.totCartas) {
            //             console.log("SUma: "+this.suma)
            //             this.suma=this.suma+parseInt(valor)
            //             this.cartasSumadas++
            //         }
            //     }
            // }
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

