import mongoose from 'mongoose';

const platoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    descripcion: {
        type: String
    },
    // Relación con MenuSitio - un plato puede estar disponible en varios sitios
    menuSitios: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuSitio'
    }]
}, {
    timestamps: true
});

export default mongoose.model('Plato', platoSchema);