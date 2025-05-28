import Plato from "../models/Plato.js";
import Sitio from "../models/Sitio.js";

export const createDish = async (req, res) => {
    try {
        if (req.user.rol !== 'ADMIN') return res.status(403).json({ message: 'No tienes permiso para crear platos.' });

        const { nombre, precio, sitio } = req.body;
        if (!nombre || !precio || !sitio) return res.status(400).json({ message: 'Faltan campos requeridos' });

        const sitioDoc = await Sitio.findOne({ nombre: sitio });
        if (!sitioDoc) return res.status(404).json({ message: 'Sitio no encontrado' });

        const platoExistente = await Plato.findOne({ nombre, sitio: sitioDoc._id });
        if (platoExistente) return res.status(400).json({ message: 'El plato ya existe en ese sitio' });

        const nuevoPlato = new Plato({ nombre, precio, sitio: sitioDoc._id });
        await nuevoPlato.save();
        res.status(201).json(nuevoPlato);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el plato', error: error.message });
    }
};

export const getAllDishes = async (req, res) => {
    try {
        const platos = await Plato.find().populate('sitio');
        res.json(platos);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los platos', error: error.message });
    }
};

export const getDishById = async (req, res) => {
    try {
        const plato = await Plato.findById(req.params.id).populate('sitio');
        if (!plato) return res.status(404).json({ message: 'Plato no encontrado' });
        res.json(plato);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el plato', error: error.message });
    }
};

export const updateDish = async (req, res) => {
    try {
        if (req.user.rol !== 'ADMIN') return res.status(403).json({ message: 'No tienes permiso para editar platos.' });

        const { nombre, precio } = req.body;
        const platoActualizado = await Plato.findByIdAndUpdate(
            req.params.id,
            { nombre, precio },
            { new: true }
        );
        if (!platoActualizado) return res.status(404).json({ message: 'Plato no encontrado' });
        res.json(platoActualizado);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el plato', error: error.message });
    }
};

export const deleteDish = async (req, res) => {
    try {
        if (req.user.rol !== 'ADMIN') return res.status(403).json({ message: 'No tienes permiso para eliminar platos.' });

        await Plato.findByIdAndDelete(req.params.id);
        res.json({ message: 'Plato eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el plato', error: error.message });
    }
};
