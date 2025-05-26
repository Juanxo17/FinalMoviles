import mongoose from 'mongoose';

const visitaSchema = new mongoose.Schema({
    fechaVisita: {
        type: Date,
        required: true
    },
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    sitio: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sitio',
        required: true
    }
}, {
    timestamps: true
});

export default  mongoose.model('Visita', visitaSchema);