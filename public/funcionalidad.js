var app = new Vue({
    el: '#app',
    data: {
        inicio: true,
        jugar: false,
        botonInicio: true,
        puesto: {
            Puesto: 0,
        },
        dinero: 100000,
        apuesta: 0,
        suma: 0,
        cartasSumadas: 0,
        totCartas: 2,
        datosJuego: {
            Estado: '',
            Segundos: 0,
            Cartas: {
                Valor: '',
                Tipo: '',
            },
            Turno: 0
        },

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
            console.log("ESTADO: " + this.datosJuego.Estado)
            this.update()
        },
        async updatePuesto() {
            let response = await fetch('http://172.105.20.118:8080/puesto')
            this.puesto = await response.json()
            console.log("PUESTO UPDATED: " + this.puesto.Puesto)
        },
        async continuarJugando() {
            this.inicio = false;
            this.jugar = true;
        },
        async salirseDelJuego() {
            let response = await fetch('http://172.105.20.118:8080/leave')
            this.datosJuego = await response.json()
            this.inicio = true;
            this.jugar = false;
            this.suma = 0
            this.cartasSumadas = 0
            this.totCartas = 2
            this.apuesta = 0

        },
        async hit() {
            if (this.datosJuego.Turno == this.puesto.Puesto) {
                console.log("HIT---->Hecho")
                let response = await fetch('http://172.105.20.118:8080/hit')
                this.totCartas++
            }
        },
        async stay() {
            let response = await fetch('http://172.105.20.118:8080/stay')
        },
        async stayPasado() {
            if (this.suma > 21) {
                this.dinero = this.dinero-this.apuesta
                this.apuesta = 0
                fetch('http://172.105.20.118:8080/stay')
            }
        },
        autoUpdate: async function () {
            setInterval(() => {
                this.update()
            }, 1000);
        },
        async update() {
            // let response = await axios.get('/estado')
            let response = await fetch('http://172.105.20.118:8080')
            this.datosJuego = await response.json()
            console.log("Segundos: " + this.datosJuego.Segundos)
            this.updatePuesto()
            this.calcSuma()
            this.stayPasado()
        },
        apostar: function (valor) {
            if (this.puesto.Puesto > 0 && this.datosJuego.Turno == this.puesto.Puesto) {
                this.apuesta +=valor
            }
        },

        calcSuma() {
            if (this.puesto.Puesto >= 0 && this.datosJuego.Cartas !== null) {
                while (this.cartasSumadas < this.totCartas) {
                    let naipe = this.datosJuego.Cartas[this.puesto.Puesto][this.cartasSumadas]
                    valor = naipe.Valor
                    if (valor == 'J' || valor == 'Q' || valor == 'K') {
                        valor = 10
                    } else if (valor == 'A') {
                        valor =11
                    }
                    console.log(this.cartasSumadas + " " + this.totCartas)
                    if (this.cartasSumadas < this.totCartas) {
                        this.suma = this.suma + parseInt(valor)
                        if (this.suma >21){
                            for (i in this.datosJuego.Cartas[this.puesto.Puesto])
                                if (i.Valor == 'A'){
                                    this.suma = this.suma -11
                                    this.suma = this.suma +1
                                }
                        }
                        console.log("SUMA: " + this.suma)
                        this.cartasSumadas++
                    }
                }

            }
            
        },
        getCartaSrc: function (index) {

            this.imgSrc.srcHost[index] = this.datosJuego.Cartas[0][index].Valor
        }
    },
    computed: {
        verCartas() {
            if (this.datosJuego.Estado == 'Disponible' || this.datosJuego.Estado == 'Recibiendo') {
                this.datosJuego.Cartas = {
                    'Valor': '',
                    'Tipo': ''
                }
            }
            return this.datosJuego.Cartas[this.puesto.Puesto]
        },
        verCartasHost() {
            if (this.datosJuego.Estado == 'Disponible' || this.datosJuego.Estado == 'Recibiendo') {
                this.datosJuego.Cartas = {
                    'Valor': '',
                    'Tipo': ''
                }
            }
            return this.datosJuego.Cartas[0]
        },
        verCartasJugadores() {
            if (this.puesto.Puesto == 1 && this.datosJuego.Estado == "Jugando") {
                try {
                    return this.datosJuego.Cartas[2]
                } catch {
                    return null
                }
            } else if (this.datosJuego.Estado == "Jugando") {
                try {
                    return [this.datosJuego.Cartas[this.puesto.Puesto - 1], this.datosJuego.Cartas[this.puesto.Puesto + 1]]
                } catch {
                    return null
                }
            }
            return
        },
    },

});