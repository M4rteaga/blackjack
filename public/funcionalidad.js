var app = new Vue({
    el: '#app',
    data: {
        inicio: true,
        jugar: false,
        continuar: false,
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
            console.log("COMIENZAR NUEVO JUEGO!")
            // let response = await axios.get('/join')
            let response = await fetch('http://172.105.20.118:8080/join')
            this.datosJuego = await response.json()
            console.log("ESTADO: " + this.datosJuego.Estado)
            console.log(this.datosJuego)
            this.updatePuesto()
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
            this.continuar = false
            this.cartasSumadas = 0
            this.totCartas = 2
            this.apuesta = 0
        },
        async hit() {
            if (this.datosJuego.Turno == this.puesto.Puesto && this.datosJuego.Estado == "Jugando") {
                console.log("HIT---->Hecho")
                let response = await fetch('http://172.105.20.118:8080/hit')
                this.datosJuego = await response.json()
                this.totCartas++
                this.calcSuma()
                this.update()
            }
        },
        async stay() {
            let response = await fetch('http://172.105.20.118:8080/stay')
        },
        async stayPasado() {
            this.dinero = this.dinero - this.apuesta
            this.apuesta = 0
            fetch('http://172.105.20.118:8080/stay')
        },
        autoUpdate: async function () {
            setInterval(() => {
                this.update()
            }, 1000);
        },
        async update() {
            // let response = await axios.get('/estado')
            let response = await fetch('http://172.105.20.118:8080')
            djR = await response.json()
            turnoViejo = this.datosJuego.Turno
            console.log(djR)
            // console.log(this.datosJuego.Turno)
            if (djR.Estado == this.datosJuego.Estado) {
                this.datosJuego = djR
                if (this.datosJuego.Estado != 'Disponible') {
                    console.log(this.datosJuego.Segundos + " segundos")
                    if (this.datosJuego.Estado == 'Jugando' && this.datosJuego.Turno != turnoViejo && this.datosJuego.Turno == this.puesto.Puesto) {
                        console.log("¡Juega y has tus apuestas!")
                        this.calcSuma()
                        console.log("El turno termina en:\n" + this.datosJuego.Segundos + " segundos")
                    }
                }
            } else {
                this.datosJuego = djR
                switch (this.datosJuego.Estado) {
                    case 'Disponible':
                        if (this.inicio)
                            console.log("Esperando ingreso.")
                        else if (this.continuar) {
                            this.continuar = false
                            this.suma = 0
                            this.cartasSumadas = 0
                            this.totCartas = 2
                            this.apuesta = 0
                            // this.datosJuego
                            this.comenzarAJugar()
                        } else
                            this.salirseDelJuego()
                        break;
                    case 'Recibiendo':
                        console.log("Esperando a otros jugadores. Faltan: ")
                        this.updatePuesto()
                        break;
                    case 'Jugando':
                        if (this.datosJuego.Turno == this.puesto.Puesto) {
                            console.log("¡Juega y has tus apuestas!")
                            this.calcSuma()
                        }
                        console.log("El turno termina en:\n" + this.datosJuego.Segundos + " segundos")
                        break;
                    case 'Done':
                        if (this.puesto.Puesto != 0) {
                            console.log("Jugador: " + this.suma)
                            this.calcularJuego()
                            this.continuar = true
                            console.log("La siguiente mesa disponible en: " + this.datosJuego.Segundos + " segundos")
                        }
                        break;
                }
            }
            // this.datosJuego = await response.json()
            // console.log("Segundos: " + this.datosJuego.Segundos + '   ' + this.datosJuego.Estado)
            // this.calcSuma()
            // this.stayPasado()
        },
        apostar: function (valor) {
            if (this.puesto.Puesto > 0 && this.datosJuego.Turno == this.puesto.Puesto && this.datosJuego.Estado == "Jugando") {
                console.log("turno: " + this.datosJuego.Turno)
                if (valor + this.apuesta <= this.dinero)
                    this.apuesta = this.apuesta + valor
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
                        valor = 11
                    }
                    if (this.cartasSumadas < this.totCartas) {
                        this.suma = this.suma + parseInt(valor)
                        if (this.suma > 21) {
                            cont = 0
                            while (this.datosJuego.Cartas[this.puesto.Puesto][cont] != null) {
                                if (this.datosJuego.Cartas[this.puesto.Puesto][cont].Valor == 'A') {
                                    this.suma = this.suma - 10
                                    console.log("con as " + this.suma)
                                }
                                cont++
                                if (this.suma <= 21)
                                    break
                            }
                        }
                        console.log("SUMA: " + this.suma)
                        this.cartasSumadas++
                    }
                }
                if (this.suma > 21) {
                    this.stayPasado()
                }
            }
        },
        calcularJuego() { //sumar la mano del host y compararla con el jugador
            if (this.suma <= 21) {
                sumHost = 0
                valHost = 0
                cont = 0
                while (this.datosJuego.Cartas[0][cont] != null) {
                    let naipe = this.datosJuego.Cartas[0][cont]
                    valHost = naipe.Valor
                    if (valHost == 'J' || valHost == 'Q' || valHost == 'K') {
                        valHost = 10
                    } else if (valHost == 'A') {
                        valHost = 11
                    }
                    sumHost += parseInt(valHost)
                    cont++
                }
                if (sumHost > 21) {
                    cont = 0
                    while (this.datosJuego.Cartas[0][cont] != null) {
                        if (this.datosJuego.Cartas[0][cont].Valor == 'A') {
                            sumHost = sumHost - 10
                            console.log("Host con as: " + sumHost)
                        }
                        cont++
                        if (sumHost <= 21)
                            break
                    }
                }
                console.log("Host: " + sumHost)
                if (sumHost > 21) {
                    console.log("¡Ganaste el juego!")
                    this.dinero = this.dinero + this.apuesta * 2
                } else if (this.suma == sumHost) {
                    console.log("¡Empate!")
                    this.dinero = this.dinero + this.apuesta
                } else if (this.suma > sumHost) {
                    console.log("¡Ganaste el juego!")
                    this.dinero = this.dinero + this.apuesta * 2
                } else if (this.suma < sumHost) {
                    console.log("¡Bohoo! Perdiste")
                    this.dinero = this.dinero - this.apuesta
                }
            } else {
                console.log("¡Bohoo! Perdiste")
            }
        },
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
    },

});